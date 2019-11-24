const process = require('process')
const { query, queryFile } = require('../db')

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

const pluginQueue = { '1': [{ id: 1 }, { id: 3 }], '2': [{ id: 2 }] }

async function logStats(pluginId, diffTime, input, output, stats) {
  await query(
    'INSERT INTO plugin_stats (plugin_id, start_time, diff_time, input, output, stats) VALUES ($1, now(), $2, $3, $4, $5)',
    [pluginId, diffTime, input, output, stats]
  )
}
async function runWork(workId) {
  const plugin_queue = pluginQueue[work[workId].type_id]
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
    let { output, stats } = plugin.runPlugin(work[workId].text, plugin.settings)
    await snooze(3000)
    const diffTime = process.hrtime(startTime)
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
    work[workId].text = output
    worker_count--
  }
  work[workId].result = { result: work[workId].text }
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
    pluginQueue: ({ id }) =>
      pluginQueue[id].map(({ id }) => {
        return { id, ...plugins[id] }
      })
  },
  WorkQueueMutation: {
    add_work: (_, { language, type_id, text }) => {
      work = [
        ...work,
        {
          stage: 'WaitingForCompilation',
          language,
          type_id,
          text,
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
    check_work_result: (_, { id }) => {
      return work[id].stage === 'Done'
    }
  }
}
