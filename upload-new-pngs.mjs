// upload-new-pngs.mjs
//
// Uploads every image file in a local folder to Sanity as a new pngImage
// document, so they join the PNG page's random rotation.
//
// Usage:
//   node upload-new-pngs.mjs ~/Desktop/new-pngs
//   node upload-new-pngs.mjs ~/Desktop/new-pngs --dry-run

import 'dotenv/config'
import { createClient } from '@sanity/client'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

const folder = process.argv[2]
const DRY_RUN = process.argv.includes('--dry-run')

if (!folder) {
  console.error('Usage: node upload-new-pngs.mjs /path/to/folder [--dry-run]')
  process.exit(1)
}

const SANITY_TOKEN = process.env.SANITY_API_TOKEN
if (!SANITY_TOKEN) {
  console.error('Missing SANITY_API_TOKEN in .env')
  process.exit(1)
}

const sanity = createClient({
  projectId: 'mys1vx17',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: SANITY_TOKEN,
  useCdn: false,
})

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp']

function isImageFile(filename) {
  const lower = filename.toLowerCase()
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

function niceAltText(filename) {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
}

async function run() {
  const entries = readdirSync(folder).filter((f) => {
    const fullPath = join(folder, f)
    return statSync(fullPath).isFile() && isImageFile(f)
  })

  console.log(`Found ${entries.length} image file(s) in ${folder}\n`)

  if (DRY_RUN) {
    console.log('DRY RUN — nothing uploaded. Files found:')
    entries.forEach((f) => console.log(' -', f))
    return
  }

  let count = 0
  for (const filename of entries) {
    count++
    console.log(`(${count}/${entries.length}) ${filename}`)
    try {
      const filePath = join(folder, filename)
      const buffer = readFileSync(filePath)
      const asset = await sanity.assets.upload('image', buffer, { filename })

      await sanity.create({
        _type: 'pngImage',
        image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
        altText: niceAltText(filename),
      })
    } catch (err) {
      console.error(`  Failed: ${err.message}`)
    }
  }

  console.log('\nDone! Check Sanity Studio, then your PNG page will pick these up on the next rebuild.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
