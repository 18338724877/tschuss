import 'dotenv/config'
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'

const sanity = createClient({
  projectId: 'mys1vx17',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function run() {
  const updates = JSON.parse(readFileSync('./archive-data-links.json'))
  const existing = await sanity.fetch(`*[_type == "archiveItem"]{_id, title}`)

  for (const update of updates) {
    const match = existing.find((doc) => doc.title === update.title)
    if (!match) {
      console.log(`No match found for "${update.title}" — skipping`)
      continue
    }
    await sanity.patch(match._id).set({ description: update.description }).commit()
    console.log(`Updated: ${update.title}`)
  }
  console.log('\nDone!')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
