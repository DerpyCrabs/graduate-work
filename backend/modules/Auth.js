const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const config = require('../config')
const { query, queryFile } = require('../db')

module.exports = {
  Schema: `
  type User {
    email: String!
    role: String!
  }
  extend type Query {
    me: User
    users: [User!]
  }
  extend type Mutation {
    signup (email: String!, password: String!): String
    login (email: String!, password: String!): String
  }
  `,
  Query: {
    me: async (_, args, { email }) => {
      if (!email) {
        throw new Error('You are not authenticated!')
      }
      return (
        await query(
          'SELECT email, roles.name as role from users INNER JOIN roles on roles.id = users.role WHERE email = $1',
          [email]
        )
      )[0]
    },
    users: () => {
      return query(
        'SELECT email, roles.name as role FROM users JOIN roles ON roles.id = users.role',
        []
      )
    }
  },
  Mutation: {
    login: async (_, { email, password }) => {
      let user = (
        await query('SELECT email, password from users WHERE email = $1', [
          email
        ])
      )[0]
      if (!user) {
        throw new Error('No user with that email')
      }

      const valid = await bcrypt.compare(password, user.password)
      if (!valid) {
        throw new Error('Incorrect password')
      }

      return jsonwebtoken.sign({ email: user.email }, config.jwt_secret, {
        expiresIn: '30d'
      })
    },
    signup: async (_, { email, password }) => {
      let hashedPassword = await bcrypt.hash(password, 10)
      await query('INSERT INTO users (email, password) VALUES ($1, $2)', [
        email,
        hashedPassword
      ])
      return jsonwebtoken.sign({ email: email }, config.jwt_secret, {
        expiresIn: '30d'
      })
    }
  }
}
