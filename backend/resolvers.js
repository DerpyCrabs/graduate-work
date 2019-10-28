const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const config = require('./config')
const { query, queryFile } = require('./db')

const resolvers = {
  Query: {
    test: () => 'test'
  }
}

module.exports = resolvers
