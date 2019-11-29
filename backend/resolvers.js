const merge = require('lodash.merge')

module.exports = path => {
  console.log(path)
  let resolvers = {}
  const fs = require('fs')
  const path_module = require('path')
  const files = fs.readdirSync(path)
  l = files.length
  for (var i = 0; i < l; i++) {
    const f = path_module.join(path, files[i])
    resolvers = merge(resolvers, require(f))
  }
  return resolvers
}
