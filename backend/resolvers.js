const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const config = require('./config')
const { query, queryFile } = require('./db')

const resolvers = {
  Query: {
    me: async (_, args, { email }) => {
      if (!email) {
        throw new Error('You are not authenticated!')
      }
      return (await query(
        'SELECT email, roles.name as role from users INNER JOIN roles on roles.id = users.id WHERE email = $1',
        [email]
      )).rows[0]
    }
  },
  Mutation: {
    login: async (_, { email, password }) => {
      let user = (await query(
        'SELECT email, password from users WHERE email = $1',
        [email]
      )).rows[0]
      if (!user) {
        throw new Error('No user with that email')
      }

      const valid = await bcrypt.compare(password, user.password)
      if (!valid) {
        throw new Error('Incorrect password')
      }

      return jsonwebtoken.sign({ email: user.email }, config.jwt_secret, {
        expiresIn: '1d'
      })
    },
    signup: async (_, { email, password }) => {
      let hashedPassword = await bcrypt.hash(password, 10)
      await query('INSERT INTO users (email, password) VALUES ($1, $2)', [
        email,
        hashedPassword
      ])
      return jsonwebtoken.sign({ email: email }, config.jwt_secret, {
        expiresIn: '1d'
      })
    }
  }
}

module.exports = resolvers
