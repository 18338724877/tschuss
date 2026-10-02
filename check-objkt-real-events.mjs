const query = `
{
  event(
    where: { recipient_address: { _eq: "tz1a7hywiB1kEWp9kwnkUTfUtDaqsm4XhLXK" } }
    order_by: { timestamp: desc }
    limit: 15
  ) {
    event_type
    price
    price_xtz
    timestamp
    token {
      name
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
console.log(JSON.stringify(data, null, 2))
