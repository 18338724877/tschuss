const query = `
{
  token(
    where: {
      holders: { holder_address: { _eq: "tz1a7hywiB1kEWp9kwnkUTfUtDaqsm4XhLXK" }, quantity: { _gt: "0" } }
    }
  ) {
    token_id
    name
    display_uri
    timestamp
    supply
    fa_contract
    fa { name website }
    events(
      where: { recipient_address: { _eq: "tz1a7hywiB1kEWp9kwnkUTfUtDaqsm4XhLXK" }, price_xtz: { _gt: "0" } }
      order_by: { timestamp: desc }
      limit: 1
    ) {
      price_xtz
      timestamp
    }
  }
}
`

const res = await fetch('https://data.objkt.com/v3/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query }),
})
const data = await res.json()
const tokens = data.data?.token || []
const withPrice = tokens.filter((t) => t.events.length > 0)
console.log(`Total held: ${tokens.length}`)
console.log(`With a paid-price event: ${withPrice.length}`)
console.log('Sample (first 3, sorted high to low):')
withPrice.sort((a, b) => b.events[0].price_xtz - a.events[0].price_xtz)
console.log(JSON.stringify(withPrice.slice(0, 3), null, 2))
console.log('Errors:', data.errors || 'none')
