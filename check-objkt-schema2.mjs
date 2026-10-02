const query = `
{
  whereType: __type(name: "token_bool_exp") {
    inputFields { name }
  }
  holdersField: __type(name: "token") {
    fields(includeDeprecated: false) {
      name
      type { name kind ofType { name kind } }
    }
  }
  holderType: __type(name: "token_holder") {
    fields { name type { name kind } }
  }
  faType: __type(name: "fa") {
    fields { name type { name kind } }
  }
  listingType: __type(name: "listing") {
    fields { name type { name kind } }
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
