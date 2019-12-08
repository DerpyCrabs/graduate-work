const process = require('process')
const { query, queryFile } = require('../db')
const { empty } = require('../utils')

let work = []
let worker_count = 0
let max_worker_count = 2
const snooze = ms => new Promise(resolve => setTimeout(resolve, ms))

let plugins = {}
const LoadPlugins = (path => {
  const fs = require('fs')
  const path_module = require('path')
  fs.readdir(path, function(err, files) {
    var f,
      l = files.length
    for (var i = 0; i < l; i++) {
      f = path_module.join(path, files[i])
      require(f)(plugins)
    }
  })
})(__dirname + '/../plugins')

const pluginQueue = {
  '1': { language: 'C', plugins: [{ id: 1 }, { id: 3 }, { id: 4 }] },
  '2': { language: 'JS', plugins: [{ id: 2 }, { id: 4 }] }
}

async function logStats(pluginId, diffTime, input, output, stats) {
  await query(
    'INSERT INTO plugin_stats (plugin_id, start_time, diff_time, input, output, stats) VALUES ($1, now(), $2, $3, $4, $5)',
    [pluginId, diffTime, input, output, stats]
  )
}
async function runWork(workId) {
  const plugin_queue = pluginQueue[work[workId].type_id].plugins
  for (const { id: plugin_id } of plugin_queue) {
    const plugin = plugins[plugin_id]
    if (!plugin.enabled) {
      work[workId].result = 'Error'
      work[workId].stage = 'Done'
      return
    }
    while (worker_count >= max_worker_count) {
      await snooze(1000)
    }
    while (work[workId].paused === true) {
      work[workId].stage = 'Paused'
      await snooze(1000)
    }
    worker_count++
    work[workId].stage = plugin.stage
    const startTime = process.hrtime()
    let { output, stats } = plugin.runPlugin(work[workId].text, plugin.settings)
    await snooze(3000)
    const diffTime = process.hrtime(startTime)
    if (plugin.settings.stats && plugin.settings.stats === 'true') {
      await logStats(
        plugin_id,
        Math.round(diffTime[0] * 1000 + diffTime[1] / 1000000),
        work[workId].text,
        output,
        stats.join(', ')
      )
      plugins[plugin_id].stats.push(
        `Started job ${workId} at ${new Date().toLocaleString()} completed in ${Math.round(
          diffTime[0] * 1000 + diffTime[1] / 1000000
        )}`
      )
    }
    work[workId].text = output
    worker_count--
  }
  work[workId].result = { result: work[workId].text }
  work[workId].stage = 'Done'
}

module.exports = {
  Schema: `
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
    language: String!
    pluginQueue: [PluginInfo!]!
  }
  enum WorkStage {
    Paused
    WaitingForCompilation
    Compilation
    WaitingForRunning
    Running
    Done
  }
  type Work {
    id: String!
    type: WorkType!
    stage: WorkStage!
    paused: Boolean!
    result: WorkResult
  }
  type WorkQueue {
    queue: [Work!]!
  }
  type WorkQueueMutation {
    add_work(language: String!, type_id: String!, text: String!): Work!
    pause_work(work_id: String!): String!
    resume_work(work_id: String!): String!
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
  extend type Query {
    work_queue: WorkQueue!
    plugins: Plugins!
    threads: Threads!
  }
  type ThreadsMutation {
    set_count(count: Int!): Int!
  }
  extend type Mutation {
    work_queue: WorkQueueMutation!
    plugin (id: String!): PluginMutation!
    threads: ThreadsMutation!
  }
  `,
  Threads: {
    count: () => max_worker_count
  },
  ThreadsMutation: {
    set_count: (_, { count }) => {
      max_worker_count = count
      return count
    }
  },
  Plugins: {
    list: () =>
      Object.entries(plugins).map(([id, info]) => {
        return { id, ...info }
      })
  },
  PluginMutation: {
    set_setting: ({ id }, { key, value }) => {
      plugins[id].settings[key] = value
      return { key, value }
    },
    enable_plugin: ({ id }) => {
      plugins[id].enabled = true
      return 'enabled'
    },
    disable_plugin: ({ id }) => {
      plugins[id].enabled = false
      return 'disabled'
    }
  },
  WorkQueue: {
    queue: () => {
      return work.map((work, id) => {
        return { id, ...work, type: { id: work.type_id } }
      })
    }
  },
  PluginInfo: {
    settings: ({ settings }) =>
      Object.entries(settings).map(([key, value]) => {
        return { key, value }
      })
  },
  WorkType: {
    language: ({ id }) => pluginQueue[id].language,
    pluginQueue: ({ id }) =>
      pluginQueue[id].plugins.map(({ id }) => {
        return { id, ...plugins[id] }
      })
  },
  WorkQueueMutation: {
    add_work: (_, { language, type_id, text }) => {
      work = [
        ...work,
        {
          stage: 'WaitingForCompilation',
          type_id,
          text,
          paused: false,
          result: null
        }
      ]
      runWork(work.length - 1)
      return {
        id: work.length - 1,
        ...work[work.length - 1],
        type: { id: type_id }
      }
    },
    pause_work: (_, { work_id }) => {
      work[work_id].paused = true
      return 'paused'
    },
    resume_work: (_, { work_id }) => {
      work[work_id].paused = false
      return 'resumed'
    }
  },
  Query: {
    threads: empty,
    work_queue: empty,
    plugins: empty
  },
  Mutation: {
    work_queue: empty,
    plugin: empty,
    threads: empty
  }
}
