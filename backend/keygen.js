const crypto = require('crypto')
const key = Buffer.from('0123456701234567'.repeat(4), 'hex')
const iv = Buffer.from('01230123'.repeat(4), 'hex')

function encrypt(text) {
  let cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return encrypted.toString('hex')
}

try {
  const keyData = {
    name: process.argv[2],
    organization: process.argv[3],
    threads: parseInt(process.argv[4]),
    graphics: JSON.parse(process.argv[5]),
    vendor: process.argv[6],
    product: process.argv[7]
  }
  console.log(encrypt(JSON.stringify(keyData)))
} catch (e) {
  console.log(e)
}
