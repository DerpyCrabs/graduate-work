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
  C: { plugins: [{ id: 1 }, { id: 3 }, { id: 4 }] },
  JS: { plugins: [{ id: 2 }, { id: 4 }] },
  Rust: { plugins: [{ id: 7 }, { id: 3 }, { id: 4 }] },
  Clojure: { plugins: [{ id: 5 }, { id: 4 }] },
  Python: { plugins: [{ id: 6 }, { id: 4 }] }
}

let testsList = {
  '1': {
    name: 'hello world',
    description: 'print stdin to stdout',
    checks: [
      { expected: '5', input: '5' },
      { expected: '6', input: '6' }
    ]
  },
  '2': {
    name: 'duplicate',
    description: 'duplicate stdin',
    checks: [{ expected: '55', input: '5' }]
  }
}

async function logStats(pluginId, diffTime, input, output, stats) {
  await query(
    'INSERT INTO plugin_stats (plugin_id, start_time, diff_time, input, output, stats) VALUES ($1, now(), $2, $3, $4, $5)',
    [pluginId, diffTime, input, output, stats]
  )
}
async function logStudentStats(studentEmail, testId, errorsCount, language) {
  await query(
    'INSERT INTO student_stats (student_id, test_id, done_at, errors, language) VALUES ((SELECT id FROM users WHERE email = $1 LIMIT 1), $2, now(), $3, $4)',
    [studentEmail, testId, errorsCount, language]
  )
}
async function runWork(workId) {
  const plugin_queue = pluginQueue[work[workId].language].plugins
  const tests = testsList[work[workId].type_id].checks
  for (const test of tests) {
    work[workId].pipe = {
      code: work[workId].text,
      input: test.input,
      expected: test.expected
    }
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
      worker_count++
      work[workId].stage = plugin.stage
      const startTime = process.hrtime()
      let { output, stats } = plugin.runPlugin(
        work[workId].pipe,
        plugin.settings
      )
      await snooze(500)
      const diffTime = process.hrtime(startTime)
      if (plugin.settings.stats && plugin.settings.stats === 'true') {
        await logStats(
          plugin_id,
          Math.round(diffTime[0] * 1000 + diffTime[1] / 1000000),
          JSON.stringify(work[workId].pipe),
          output,
          stats.join(', ')
        )
      }
      work[workId].pipe = output
      worker_count--
    }
    if (work[workId].pipe.result === 'false') {
      work[workId].errors.push(
        `expected ${test.expected} but got ${work[workId].pipe.output}`
      )
    }
  }
  logStudentStats(
    work[workId].student,
    work[workId].type_id,
    work[workId].errors.length,
    work[workId].language
  )
  work[workId].stage = 'Done'
}

module.exports = {
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
        return {
          id,
          ...work,
          type: { language: work.language, id: work.type_id }
        }
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
    pluginQueue: ({ id, language }) =>
      pluginQueue[language].plugins.map(({ id }) => {
        return { id, ...plugins[id] }
      })
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
    }
  },
  WorkQueueMutation: {
    add_work: (_, { language, type_id, text }, { email }) => {
      work = [
        ...work,
        {
          stage: 'WaitingForCompilation',
          type_id,
          language,
          text,
          student: email,
          errors: []
        }
      ]
      runWork(work.length - 1)
      return {
        id: work.length - 1,
        ...work[work.length - 1],
        type: { id: type_id, language }
      }
    }
  },

  Query: {
    threads: empty,
    work_queue: empty,
    plugins: empty,
    tests: () =>
      Object.entries(testsList).map(([id, test]) => ({ id, ...test }))
  },
  TestsMutation: {
    add_test: (_, { name, description }) => {
      nextId = Object.keys(testsList).length + 1
      testsList[nextId] = { name, description, checks: [] }
      return testsList[nextId]
    },
    remove_test: (_, { test_id }) => {
      delete testsList[test_id]
      return 'removed'
    },
    add_check: (_, { test_id, input, expected }) => {
      testsList[test_id].checks.push({ input, expected })
      return testsList[test_id]
    },
    remove_check: (_, { test_id, input, expected }) => {
      testsList[test_id].checks = testsList[test_id].checks.filter(
        test => test.input !== input || test.expected !== expected
      )
      return testsList[test_id]
    }
  },
  Mutation: {
    work_queue: empty,
    plugin: empty,
    threads: empty,
    tests: empty
  },
  Schema: `
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
  }
  type WorkType {
    id: String!
    language: String!
    pluginQueue: [PluginInfo!]!
  }
  enum WorkStage {
    WaitingForCompilation
    Compilation
    WaitingForRunning
    Running
    Testing
    Done
  }
  type Work {
    id: String!
    type: WorkType!
    stage: WorkStage!
    errors: [String!]!
  }
  type WorkQueue {
    queue: [Work!]!
  }
  type WorkQueueMutation {
    add_work(language: String!, type_id: String!, text: String!): Work!
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
  extend type Query {
    work_queue: WorkQueue!
    plugins: Plugins!
    threads: Threads!
    tests: [Test!]
  }
  type ThreadsMutation {
    set_count(count: Int!): Int!
  }
  type TestsMutation {
    add_test (name: String!, description: String!): Test!
    remove_test (test_id: String!): String!
    add_check (test_id: String!, input: String!, expected: String!): Test!
    remove_check (test_id: String!, input: String!, expected: String!): Test!
  }
  extend type Mutation {
    work_queue: WorkQueueMutation!
    plugin (id: String!): PluginMutation!
    threads: ThreadsMutation!
    tests: TestsMutation!
  }
  `
}
