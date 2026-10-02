import 'dotenv/config'
import { createClient } from '@sanity/client'

const WALLET = 'tz1a7hywiB1kEWp9kwnkUTfUtDaqsm4XhLXK'
const SANITY_TOKEN = process.env.SANITY_API_TOKEN
const PINATA_DOMAIN = process.env.PINATA_GATEWAY_DOMAIN
const PINATA_TOKEN = process.env.PINATA_GATEWAY_TOKEN
const DRY_RUN = process.argv.includes('--dry-run')

if (!SANITY_TOKEN || !PINATA_DOMAIN || !PINATA_TOKEN) {
  console.error('Missing SANITY_API_TOKEN, PINATA_GATEWAY_DOMAIN, or PINATA_GATEWAY_TOKEN in .env')
  process.exit(1)
}

const sanity = createClient({
  projectId: 'mys1vx17',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: SANITY_TOKEN,
  useCdn: false,
})

const query = `
{
  token(
    where: {
      holders: { holder_address: { _eq: "${WALLET}" }, quantity: { _gt: "0" } }
    }
  ) {
    token_id
    name
    display_uri
    supply
    fa_contract
    creators {
      holder { alias website tzdomain }
    }
    events(
      where: { recipient_address: { _eq: "${WALLET}" }, price_xtz: { _gt: "0" } }
      order_by: { timestamp: desc }
      limit: 1
    ) {
      price_xtz
      timestamp
    }
  }
}
`

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function hashFromUri(uri) {
  return uri.replace('ipfs://', '')
}

async function uploadImage(uri, filename) {
  const hash = hashFromUri(uri)
  const url = `https://${PINATA_DOMAIN}/ipfs/${hash}?pinataGatewayToken=${PINATA_TOKEN}`
  const res = await fetch(url)
  const contentType = res.headers.get('content-type') || ''
  if (!res.ok || !contentType.startsWith('image/')) {
    throw new Error(`Gateway returned ${res.status} / ${contentType}`)
  }
  const buffer = Buffer.from(await res.arrayBuffer())
  const asset = await sanity.assets.upload('image', buffer, { filename })
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
}

async function migrate() {
  const res = await fetch('https://data.objkt.com/v3/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const json = await res.json()
  const allTokens = json.data?.token || []

  const nfts = allTokens.filter((t) => t.events.length > 0 && t.display_uri)
  console.log(`Found ${nfts.length} NFTs with a paid-price event and an image.\n`)

  if (DRY_RUN) {
    console.log('DRY RUN. Sample:')
    console.log(JSON.stringify(nfts[0], null, 2))
    return
  }

  let count = 0
  let failures = []
  for (const nft of nfts) {
    count++
    console.log(`(${count}/${nfts.length}) ${nft.name}`)
    try {
      const image = await uploadImage(nft.display_uri, `${nft.token_id}.png`)
      const creator = nft.creators?.[0]?.holder
      const paidEvent = nft.events[0]

      await sanity.create({
        _type: 'nftPurchase',
        title: nft.name,
        tokenId: nft.token_id,
        faContract: nft.fa_contract,
        image,
        artist: creator?.alias || creator?.tzdomain || 'Unknown',
        artistUrl: creator?.website || undefined,
        supply: nft.supply,
        purchasedAt: paidEvent.timestamp,
        paidMutez: paidEvent.price_xtz,
        tokenUrl: `https://objkt.com/tokens/${nft.fa_contract}/${nft.token_id}`,
      })
    } catch (err) {
      console.error(`  Failed: ${err.message}`)
      failures.push(nft.name)
    }
    await sleep(200)
  }

  console.log(`\nDone! ${count - failures.length}/${count} succeeded.`)
  if (failures.length > 0) {
    console.log(`Failed (${failures.length}):`, failures.join(', '))
  }
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
