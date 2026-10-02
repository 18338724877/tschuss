const query = `
{
  eventType: __type(name: "event") {
    fields {
      name
      type { name kind ofType { name kind } }
    }
  }
  eventTypeEnum: __type(name: "event_type") {
    enumValues { name }
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
