const query = `
{
  token(where: { token_id: {_eq: "14"}, fa_contract: {_eq: "KT1P2Jt3PuoKfYrDqeZozqjYy7zwFkanKpuw"} }) {
    name
    display_uri
    thumbnail_uri
    artifact_uri
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
