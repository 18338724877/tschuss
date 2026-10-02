import { writeFileSync, mkdirSync } from 'fs'

const assets = [
  ['nav-logo.png', 'https://cdn.prod.website-files.com/636a8d89ddf0767a45170bb8/65516350d6f9d81d7012cb62_choooooose%20icon%20png.png'],
  ['blog-header-logo.png', 'https://cdn.prod.website-files.com/636a8d89ddf0767a45170bb8/6425fbb97c79eca8ff2e4935_der%20blog%20new-p-1600.png'],
  ['png-header.png', 'https://cdn.prod.website-files.com/636a8d89ddf0767a45170bb8/6499e9ef22d5eaa2ef6fabfb_png%20page%20header%20for%20real-p-1600.png'],
  ['png-example-poster.gif', 'https://cdn.prod.website-files.com/636a8d89ddf0767a45170bb8/6650b2735594e8da07b58fbb_poster-example-ezgif.com-resize.gif'],
  ['png-example-shirt.gif', 'https://cdn.prod.website-files.com/636a8d89ddf0767a45170bb8/6650b2a1815224f5813e3b9c_shirt-example-gif-ezgif.com-resize.gif'],
  ['png-speech-bubble-top.gif', 'https://cdn.prod.website-files.com/636a8d89ddf0767a45170bb8/663acd5095250af9f70d6e19_pixel-speech-bubble%20(2).gif'],
  ['png-speech-bubble-bottom.gif', 'https://cdn.prod.website-files.com/636a8d89ddf0767a45170bb8/663acdcc777d6c7669144a95_pixel-speech-bubble%20(3).gif'],
  ['hotline-header.png', 'https://cdn.prod.website-files.com/636a8d89ddf0767a45170bb8/659eecacb97c846f20ce9c39_833new%20header.png'],
  ['hotline-cord.png', 'https://cdn.prod.website-files.com/636a8d89ddf0767a45170bb8/64b04b046929bc975731c255_PHONE%20CORD.png'],
  ['social-instagram.png', 'https://cdn.prod.website-files.com/636a8d89ddf0767a45170bb8/659ff466ce6a9c1f6d1b9fa4_sta%20logo%20copy.png'],
  ['social-tiktok.png', 'https://cdn.prod.website-files.com/636a8d89ddf0767a45170bb8/64c3291ac8b5a5a8b324696e_tiktok.png'],
  ['social-x.png', 'https://cdn.prod.website-files.com/636a8d89ddf0767a45170bb8/659feb369cd566f2350c9350_X_logo.png'],
  ['social-threads.png', 'https://cdn.prod.website-files.com/636a8d89ddf0767a45170bb8/659feb7c9cd566f2350ccb5e_threads%20logo.png'],
  ['social-bluesky.png', 'https://cdn.prod.website-files.com/636a8d89ddf0767a45170bb8/659febf90f120428495bfa06_bluesky%20logo.png'],
  ['hotline-call-button.png', 'https://cdn.prod.website-files.com/636a8d89ddf0767a45170bb8/659fed11d8b41e522e36385c_CALL%20LOGO.png'],
  ['hotline-text-button.png', 'https://cdn.prod.website-files.com/636a8d89ddf0767a45170bb8/659fef1f6321ea613714fea1_text%20now.png'],
  ['hotline-desktop.png', 'https://cdn.prod.website-files.com/636a8d89ddf0767a45170bb8/659fefc5d2e75fe629476498_LAPPY.png'],
  ['nft-header.png', 'https://cdn.prod.website-files.com/636a8d89ddf0767a45170bb8/6483755405aabc361507528c_TSCHUSEUM-p-1600.png'],
]

mkdirSync('public/assets', { recursive: true })

let count = 0
for (const [filename, url] of assets) {
  count++
  console.log(`(${count}/${assets.length}) ${filename}`)
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    writeFileSync(`public/assets/${filename}`, buffer)
  } catch (err) {
    console.error(`  Failed: ${err.message}`)
  }
}

console.log('\nDone! Check public/assets/')
