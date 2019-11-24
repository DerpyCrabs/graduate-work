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
    id: String!
    enabled: Boolean!
    name: String!
    stage: String!
    version: String!
    settings: [PluginSetting!]!
    stats: [String!]
  }
  type WorkType {
    id: String!
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
    id: String!
    language: String!
    type: WorkType!
    stage: WorkStage!
    result: WorkResult
  }
  type WorkQueue {
    queue: [Work!]!
  }
  type WorkQueueMutation {
    add_work(language: String!, type_id: String!, text: String!): Work!
    check_work_result(id: String!): Boolean!
  }
  type PluginMutation {
    set_setting(key: String!, value: String!): PluginSetting
    enable_plugin: String
    disable_plugin: String
  }
  type Plugins {
    list: [PluginInfo!]!
  }
  type Threads {
    count: Int!
  }
  type Query {
    me: User
    users: [User!]
    work_queue: WorkQueue!
    plugins: Plugins!
    threads: Threads!
  }
  type ThreadsMutation {
    set_count(count: Int!): Int!
  }
  type Mutation {
    signup (email: String!, password: String!): String
    login (email: String!, password: String!): String
    work_queue: WorkQueueMutation!
    plugin (id: String!): PluginMutation!
    threads: ThreadsMutation!
  }
`
module.exports = typeDefs
