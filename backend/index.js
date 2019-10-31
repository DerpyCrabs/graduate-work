const express = require('express')
const bodyParser = require('body-parser')
const { ApolloServer } = require('apollo-server-express')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const jwt = require('jsonwebtoken')
const config = require('./config')
const cors = require('cors')

const context = ({ req }) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization || ''
    try {
      return ({ email } = jwt.verify(token.split(' ')[1], config.jwt_secret))
    } catch (e) {
      throw new Error('Authentication token is invalid')
    }
  } else {
    return {}
  }
}

const server = new ApolloServer({ typeDefs, resolvers, context })
const app = express()

const PORT = 3000
app.use(cors())
server.applyMiddleware({ app })

app.listen(PORT, '0.0.0.0', () => {
  console.log(`The server is running on 0.0.0.0:${PORT}/${server.graphqlPath}`)
})
