import 'dotenv/config'
import { createClient } from '@sanity/client'

const WEBFLOW_TOKEN = process.env.WEBFLOW_API_TOKEN
const COLLECTION_ID = process.env.WEBFLOW_PNG_COLLECTION_ID
const SANITY_TOKEN = process.env.SANITY_API_TOKEN
const DRY_RUN = process.argv.includes('--dry-run')

if (!WEBFLOW_TOKEN || !COLLECTION_ID || !SANITY_TOKEN) {
  console.error('Missing WEBFLOW_API_TOKEN, WEBFLOW_PNG_COLLECTION_ID, or SANITY_API_TOKEN in .env')
  process.exit(1)
}

const sanity = createClient({
  projectId: 'mys1vx17',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: SANITY_TOKEN,
  useCdn: false,
})

async function fetchAllItems() {
  const all = []
  let offset = 0
  const limit = 100
  while (true) {
    const res = await fetch(
      `https://api.webflow.com/v2/collections/${COLLECTION_ID}/items?limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${WEBFLOW_TOKEN}`, Accept: 'application/json' } }
    )
    if (!res.ok) throw new Error(`Webflow API error: ${res.status} ${await res.text()}`)
    const data = await res.json()
    const items = data.items || []
    all.push(...items)
    if (items.length < limit) break
    offset += limit
  }
  return all
}

// Finds the first field on an item that looks like an image ({ url: ... })
function findImage(fieldData) {
  for (const [key, value] of Object.entries(fieldData)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && value.url) {
      return { key, url: value.url, alt: value.alt || '' }
    }
  }
  return null
}

async function uploadImage(url) {
  const res = await fetch(url)
  const buffer = Buffer.from(await res.arrayBuffer())
  const asset = await sanity.assets.upload('image', buffer, { filename: url.split('/').pop() })
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
}

async function migrate() {
  const items = await fetchAllItems()
  console.log(`Found ${items.length} item(s) in the PNG collection.\n`)

  if (items.length > 0) {
    console.log('Fields on the first item:', Object.keys(items[0].fieldData))
    const found = findImage(items[0].fieldData)
    console.log('Detected image field:', found ? found.key : 'NONE FOUND')
    console.log('')
  }

  const withImages = items.filter((i) => findImage(i.fieldData))
  console.log(`${withImages.length} of ${items.length} items have an image.\n`)

  if (DRY_RUN) {
    console.log('DRY RUN. Nothing written.')
    return
  }

  let count = 0
  for (const item of withImages) {
    const found = findImage(item.fieldData)
    count++
    console.log(`(${count}/${withImages.length}) ${item.fieldData.name || item.id}`)
    try {
      const image = await uploadImage(found.url)
      await sanity.create({
        _type: 'pngImage',
        image,
        altText: found.alt || item.fieldData.name || '',
      })
    } catch (err) {
      console.error(`  Failed: ${err.message}`)
    }
  }

  console.log('\nDone! Check Sanity Studio.')
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
