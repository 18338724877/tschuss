const query = `
{
  token(
    where: {
      holders: { holder_address: { _eq: "tz1a7hywiB1kEWp9kwnkUTfUtDaqsm4XhLXK" }, quantity: { _gt: "0" } }
    }
    order_by: { lowest_ask: desc }
  ) {
    token_id
    name
    display_uri
    lowest_ask
    fa {
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
const tokens = data.data?.token || []
console.log(`Total tokens found: ${tokens.length}`)
console.log('First 3:')
console.log(JSON.stringify(tokens.slice(0, 3), null, 2))
console.log('Any errors:', data.errors || 'none')
