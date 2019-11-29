const merge = require('lodash.merge')
const { mergeSchemas } = require('graphql-tools')
const gql = require('graphql-tag')

module.exports = (path => {
  console.log(path)
  let resolvers = {}
  let schemas = [
    `
  type Query
  type Mutation
  `
  ]
  const fs = require('fs')
  const path_module = require('path')
  const files = fs.readdirSync(path)
  l = files.length
  for (var i = 0; i < l; i++) {
    const f = path_module.join(path, files[i])
    const { Schema: schema, ...moduleResolvers } = require(f)
    resolvers = merge(resolvers, moduleResolvers)
    schemas.push(schema)
  }
  return {
    typeDefs: schemas,
    resolvers
  }
})(__dirname + '/resolvers/')
