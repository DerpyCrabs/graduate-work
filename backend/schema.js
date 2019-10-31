const typeDefs = `
  type User {
    email: String!
  }
  type Query {
    me: User
    users: [User!]
  }
  type Mutation {
    signup (email: String!, password: String!): String
    login (email: String!, password: String!): String
  }
`
module.exports = typeDefs
