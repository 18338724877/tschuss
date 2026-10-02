const query = `
{
  token(
    where: {
      holders: { holder_address: { _eq: "tz1a7hywiB1kEWp9kwnkUTfUtDaqsm4XhLXK" }, quantity: { _gt: "0" } }
      lowest_ask: { _is_null: false }
    }
    order_by: { lowest_ask: desc }
    limit: 5
  ) {
    token_id
    name
    lowest_ask
    fa_contract
    creators {
      holder {
        alias
        address
        website
        tzdomain
      }
    }
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
console.log(JSON.stringify(data, null, 2))
