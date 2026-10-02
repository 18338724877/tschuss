const url = 'https://coral-key-elephant-654.mypinata.cloud/ipfs/QmWMQeizTzwnBSSLSkvPFL27hPR79n1WLneWCBmny1krdJ?pinataGatewayToken=l2AztSbyuFT-iH9gls5faujoPLWKgQs90epu6WVDXvo7KlGAIRczNdj61lVUa4b9'

const res = await fetch(url)
console.log('Status:', res.status)
console.log('Content-Type:', res.headers.get('content-type'))
if (res.ok) {
  const buffer = Buffer.from(await res.arrayBuffer())
  console.log('Bytes received:', buffer.length)
}
