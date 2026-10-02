const query = `
{
  event(
    where: {
      recipient_address: { _eq: "tz1a7hywiB1kEWp9kwnkUTfUtDaqsm4XhLXK" }
      price: { _gt: "0" }
    }
    order_by: { timestamp: desc }
    limit: 10
  ) {
    event_type
    marketplace_event_type
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
