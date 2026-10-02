// migrate-blog-from-webflow.mjs
//
// Pulls Blog Post items from a Webflow CMS collection and creates matching
// documents in Sanity. Run a DRY RUN first to check field names before
// writing anything for real.

import 'dotenv/config'
import { createClient } from '@sanity/client'

const WEBFLOW_TOKEN = process.env.WEBFLOW_API_TOKEN
const WEBFLOW_COLLECTION_ID = process.env.WEBFLOW_COLLECTION_ID
const SANITY_TOKEN = process.env.SANITY_API_TOKEN
const DRY_RUN = process.argv.includes('--dry-run')

const SANITY_PROJECT_ID = 'mys1vx17'
const SANITY_DATASET = 'production'

if (!WEBFLOW_TOKEN || !WEBFLOW_COLLECTION_ID || !SANITY_TOKEN) {
  console.error(
    'Missing one of: WEBFLOW_API_TOKEN, WEBFLOW_COLLECTION_ID, SANITY_API_TOKEN in your .env file.'
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

async function uploadImageToSanity(imageUrl) {
  if (!imageUrl) return undefined
  const imageRes = await fetch(imageUrl)
  const buffer = Buffer.from(await imageRes.arrayBuffer())
  const asset = await sanity.assets.upload('image', buffer, {
    filename: imageUrl.split('/').pop(),
  })
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id }, _key: cryptoKey() }
}

function cryptoKey() {
  return Math.random().toString(36).slice(2, 10)
}

function htmlToBlocks(html = '') {
  const paragraphs = html
    .split(/<\/p>|<br\s*\/?>/i)
    .map((p) => p.replace(/<[^>]+>/g, '').trim())
    .filter(Boolean)

  return paragraphs.map((text) => ({
    _type: 'block',
    _key: cryptoKey(),
    style: 'normal',
    children: [{ _type: 'span', _key: cryptoKey(), text }],
  }))
}

function plainTextToBlock(text) {
  if (!text || !text.trim()) return null
  return {
    _type: 'block',
    _key: cryptoKey(),
    style: 'normal',
    children: [{ _type: 'span', _key: cryptoKey(), text: text.trim() }],
  }
}

// The order these body-related fields appear in your Webflow template.
// Adjust this list if your dry-run output shows different field names.
const BODY_FIELD_ORDER = [
  'body',
  'image-2',
  'multi-instead-1',
  'body-2-rich',
  'body-2',
  'image-3',
  'multi-instead',
  'body-3',
]

async function buildBodyBlocks(f) {
  const blocks = []

  for (const key of BODY_FIELD_ORDER) {
    const value = f[key]
    if (value === null || value === undefined || value === '') continue

    // Single Webflow image field: { url, alt, ... }
    if (typeof value === 'object' && !Array.isArray(value) && value.url) {
      const img = await uploadImageToSanity(value.url)
      if (img) blocks.push(img)
      continue
    }

    // Multi-image field: an array of { url, ... }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item?.url) {
          const img = await uploadImageToSanity(item.url)
          if (img) blocks.push(img)
        }
      }
      continue
    }

    // Rich text (contains HTML tags)
    if (typeof value === 'string' && /<[a-z][\s\S]*>/i.test(value)) {
      blocks.push(...htmlToBlocks(value))
      continue
    }

    // Plain text
    if (typeof value === 'string') {
      const block = plainTextToBlock(value)
      if (block) blocks.push(block)
    }
  }

  return blocks
}

async function migrate() {
  const items = await fetchWebflowItems()
  console.log(`Found ${items.length} item(s) in the Webflow collection.\n`)

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

    const coverImage = f['main-post-image']?.url
      ? await uploadImageToSanity(f['main-post-image'].url)
      : undefined

    const body = await buildBodyBlocks(f)

    const doc = {
      _type: 'blogPost',
      title: f.name,
      subtitle: f.headline || '',
      slug: { _type: 'slug', current: f.slug },
      publishedDate: item.lastPublished || item.createdOn,
      closing: f.closing || '',
      link: f.link || undefined,
      videoLink: f['video-link'] || undefined,
      body,
      ...(coverImage ? { coverImage } : {}),
    }

    await sanity.create(doc)
  }

  console.log('\nDone! Check your Sanity Studio to confirm everything looks right.')
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})