const { empty } = require('../utils')
const { query } = require('../db')

module.exports = {
  Schema: `
  extend type Query {
    stats: Stats!
  }
  type Stats {
    test_completion: [TestCompletion]
    plugin_runtime: [PluginRuntime]
  }
  type TestCompletion {
    test_id: String!
    test_name: String!
    student_email: String!
    errors: Int!
    done_at: String!
    language: String!
  }
  type PluginRuntime {
    id: String!
    name: String!
    start_time: String!
    run_time: String!
  }`,
  Query: { stats: empty },
  Stats: {
    test_completion: async () =>
      query(
        'SELECT test_id, test_name, users.email as student_email, errors, done_at, language FROM student_stats JOIN users on student_id = users.id',
        []
      )
  }
}
