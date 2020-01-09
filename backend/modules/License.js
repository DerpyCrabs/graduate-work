const { empty } = require('../utils')
const usb = require('usb')
const crypto = require('crypto')
const key = Buffer.from('0123456701234567'.repeat(4), 'hex')
const iv = Buffer.from('01230123'.repeat(4), 'hex')

function encrypt(text) {
  let cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return encrypted.toString('hex')
}

function decrypt(text) {
  let encryptedText = Buffer.from(text, 'hex')
  let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}

module.exports = {
  Query: {
    license: (_, { key }) => {
      if (!key) {
        return null
      }
      let keyData = null
      try {
        keyData = JSON.parse(decrypt(key))
      } catch (e) {
        console.log(e)
        return null
      }
      if (new Date(keyData.expiresOn) < new Date()) {
        return null
      }
      const devices = usb.getDeviceList().map(dev => dev.deviceDescriptor)
      if (!keyData.vendor || !keyData.product) {
        return null
      }
      for (const device of devices) {
        if (
          parseInt(keyData.vendor, 16) === device.idVendor &&
          parseInt(keyData.product, 16) === device.idProduct
        ) {
          return keyData
        }
      }

      return null
    },
	  get_key: (_, {vendor, product}) => {

  let date = new Date()
  const keyData = {
    name: "Administrator",
    organization: "SibSAU",
    threads: parseInt(10),
    graphics: true,
    vendor: vendor,
    product: product,
    expiresOn: new Date(
      date.setTime(date.getTime() + 20 * 86400000)
    )
  }
  return(encrypt(JSON.stringify(keyData)))
	  }
  },
  Schema: `
  type License {
    name: String!
    organization: String!
    threads: Int!
    graphics: Boolean!
    expiresOn: String!
  }
  extend type Query {
    license (key: String): License
    get_key (vendor: String!, product: String!): String
  }
  `
}
