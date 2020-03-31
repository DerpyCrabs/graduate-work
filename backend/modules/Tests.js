const { query } = require('../db')
const { empty } = require('../utils')

module.exports = {
  Schema: `
  extend type Query {
    tests: [Test!]
  }
  extend type Mutation {
    tests: TestsMutation!
  }
  type TestsMutation {
    add_test (name: String!, description: String!): Test!
    add_check (test_id: String!, input: String!, expected: String!): String
    remove_check (test_id: String!, input: String!, expected: String!): String
  }
  type TestCheck {
    input: String!
    expected: String!
  }
  type Test {
    id: String!
    name: String!
    description: String!
    checks: [TestCheck!]!
    completed: Boolean
  }
  `,
  Query: {
    tests: async () => await query('SELECT * FROM tests', [])
  },
  Mutation: {
    tests: empty
  },
  Test: {
    completed: async ({ id }, _, { email }) => {
      if (!email) {
        throw new Error('You must be logged in to get test completion info')
      }
      const tries = await query(
        'SELECT errors FROM student_stats JOIN users ON student_id = users.id WHERE users.email = $1 AND student_stats.test_id = $2',
        [email, id]
      )
      return tries.some(({ errors }) => errors === 0)
    },
    checks: async ({ id }) =>
      await query('SELECT * FROM test_checks WHERE test_id = $1', [id])
  },
  TestsMutation: {
    add_test: async (_, { name, description }) =>
      await query(
        'INSERT INTO tests (name, description) VALUES ($1, $2) RETURNING *',
        [name, description]
      ).then(rows => rows[0]),
    add_check: async (_, { test_id, input, expected }) => {
      await query(
        'INSERT INTO test_checks (test_id, input, expected) VALUES ($1, $2, $3)',
        [test_id, input, expected]
      )
      return 'done'
    },
    remove_check: async (_, { test_id, input, expected }) => {
      await query(
        'DELETE FROM test_checks WHERE test_id = $1 AND input = $2 AND expected = $3',
        [test_id, input, expected]
      )
      return 'done'
    }
  }
}
