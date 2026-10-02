import 'dotenv/config'
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'

const SANITY_TOKEN = process.env.SANITY_API_TOKEN
const DRY_RUN = process.argv.includes('--dry-run')

if (!SANITY_TOKEN) {
  console.error('Missing SANITY_API_TOKEN in your .env file.')
  process.exit(1)
}

const sanity = createClient({
  projectId: 'mys1vx17',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: SANITY_TOKEN,
  useCdn: false,
})

function cryptoKey() {
  return Math.random().toString(36).slice(2, 10)
}

async function uploadImageToSanity(imageUrl) {
  const imageRes = await fetch(imageUrl)
  const buffer = Buffer.from(await imageRes.arrayBuffer())
  const asset = await sanity.assets.upload('image', buffer, {
    filename: imageUrl.split('/').pop(),
  })
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id }, _key: cryptoKey() }
}

async function migrate() {
  const items = JSON.parse(readFileSync(new URL('./archive-data.json', import.meta.url)))
  console.log(`Loaded ${items.length} archive item(s).\n`)

  if (DRY_RUN) {
    console.log('DRY RUN. Nothing written. First item:')
    console.log(JSON.stringify(items[0], null, 2))
    return
  }

  for (const item of items) {
    console.log(`Migrating: ${item.title}`)
    const images = []
    for (const url of item.images) {
      images.push(await uploadImageToSanity(url))
    }
    await sanity.create({
      _type: 'archiveItem',
      title: item.title,
      description: item.description,
      images,
    })
  }

  console.log('\nDone! Check your Sanity Studio.')
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
