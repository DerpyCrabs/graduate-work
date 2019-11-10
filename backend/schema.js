const typeDefs = `
  type User {
    email: String!
    role: String!
  }
  type WorkResult {
    result: String!
  }
  type WorkType {
    id: Int!
  }
  enum WorkStage {
    WaitingForCompilation
    Compilation
    WaitingForRunning
    Running
    Done
  }
  type Work {
    id: Int!
    language: String!
    type: WorkType!
    stage: WorkStage!
    result: WorkResult
  }
  type WorkQueue {
    queue: [Work!]!
  }
  type WorkQueueMutation {
    add_work(language: String!, text: String!): Int!
    check_work_result(id: Int!): Boolean!
  }
  type Query {
    me: User
    users: [User!]
    work_queue: WorkQueue!
  }
  type Mutation {
    signup (email: String!, password: String!): String
    login (email: String!, password: String!): String
    work_queue: WorkQueueMutation!
  }
`
module.exports = typeDefs
