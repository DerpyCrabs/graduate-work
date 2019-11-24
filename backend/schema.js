const typeDefs = `
  type User {
    email: String!
    role: String!
  }
  type WorkResult {
    result: String!
  }
  type PluginSetting {
    key: String!
    value: String!
  }
  type PluginInfo {
    id: Int!
    enabled: Boolean!
    name: String!
    stage: String!
    version: String!
    settings: [PluginSetting!]!
    stats: [String!]
  }
  type WorkType {
    id: Int!
    pluginQueue: [PluginInfo!]!
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
    add_work(language: String!, type_id: Int!, text: String!): Int!
    check_work_result(id: Int!): Boolean!
  }
  type PluginMutation {
    set_setting(id: Int!, key: String!, value: String!): PluginSetting
    enable_plugin: String
    disable_plugin: String
  }
  type Query {
    me: User
    users: [User!]
    work_queue: WorkQueue!
    plugins: [PluginInfo!]!
  }
  type Mutation {
    signup (email: String!, password: String!): String
    login (email: String!, password: String!): String
    work_queue: WorkQueueMutation!
    plugin (id: Int!): PluginMutation!
  }
`
module.exports = typeDefs
