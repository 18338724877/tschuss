// migrate-archive-from-webflow.mjs
//
// Pulls Archive Item entries from Webflow and creates matching documents
// in Sanity. Run --dry-run first to check the real field names before
// writing anything for real (Webflow field names vary per project).

import 'dotenv/config'
import { createClient } from '@sanity/client'

const WEBFLOW_TOKEN = process.env.WEBFLOW_API_TOKEN
const WEBFLOW_COLLECTION_ID = process.env.WEBFLOW_ARCHIVE_COLLECTION_ID
const SANITY_TOKEN = process.env.SANITY_API_TOKEN
const DRY_RUN = process.argv.includes('--dry-run')

const SANITY_PROJECT_ID = 'mys1vx17'
const SANITY_DATASET = 'production'

if (!WEBFLOW_TOKEN || !WEBFLOW_COLLECTION_ID || !SANITY_TOKEN) {
  console.error(
    'Missing one of: WEBFLOW_API_TOKEN, WEBFLOW_ARCHIVE_COLLECTION_ID, SANITY_API_TOKEN in your .env file.'
  )
  process.exit(1)
}

const sanity = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: SANITY_TOKEN,
  useCdn: false,
})

async function fetchWebflowItems() {
  const res = await fetch(
    `https://api.webflow.com/v2/collections/${WEBFLOW_COLLECTION_ID}/items`,
    {
      headers: {
        Authorization: `Bearer ${WEBFLOW_TOKEN}`,
        Accept: 'application/json',
      },
    }
  )
  if (!res.ok) {
    throw new Error(`Webflow API error: ${res.status} ${await res.text()}`)
  }
  const data = await res.json()
  return data.items || []
}

function cryptoKey() {
  return Math.random().toString(36).slice(2, 10)
}

async function uploadImageToSanity(imageUrl) {
  if (!imageUrl) return undefined
  const imageRes = await fetch(imageUrl)
  const buffer = Buffer.from(await imageRes.arrayBuffer())
  const asset = await sanity.assets.upload('image', buffer, {
    filename: imageUrl.split('/').pop(),
  })
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id }, _key: cryptoKey() }
}

async function migrate() {
  const items = await fetchWebflowItems()
  console.log(`Found ${items.length} item(s) in the Webflow Archive collection.\n`)

  if (items.length > 0) {
    console.log('Available fields on the first item (for reference):')
    console.log(Object.keys(items[0].fieldData))
    console.log('')
  }

  if (DRY_RUN) {
    console.log('DRY RUN — nothing will be written. Preview of first item:')
    console.log(JSON.stringify(items[0]?.fieldData, null, 2))
    return
  }

  for (const item of items) {
    const f = item.fieldData
    console.log(`Migrating: ${f.name}`)

    const singleImages = ['main-image', 'image'].map((k) => f[k]?.url).filter(Boolean)
    const multiImages = Array.isArray(f['images']) ? f['images'].map((i) => i?.url).filter(Boolean) : []
    const allImageUrls = [...singleImages, ...multiImages]

    const images = []
    for (const url of allImageUrls) {
      const img = await uploadImageToSanity(url)
      if (img) images.push(img)
    }

    const doc = {
      _type: 'archiveItem',
      title: f.name,
      dropNumber: f['drop-number'] || f['drop'] || '',
      editionSize: f['edition-size'] || f['edition'] || '',
      materials: f['materials'] || '',
      description: f['description'] || f['body'] || '',
      images,
    }

    await sanity.create(doc)
  }

  console.log('\nDone! Check your Sanity Studio to confirm everything looks right.')
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
