const { empty } = require('../utils')
const usb = require('usb')
const crypto = require('crypto')
const key = Buffer.from('0123456701234567'.repeat(4), 'hex')
const iv = Buffer.from('01230123'.repeat(4), 'hex')

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
      let keyData = null
      try {
        keyData = JSON.parse(decrypt(key))
      } catch (e) {
        console.log(e)
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
    }
  },
  Schema: `
  type License {
    name: String!
    organization: String!
    threads: Int!
    graphics: Boolean!
  }
  extend type Query {
    license (key: String!): License
  }
  `
}
