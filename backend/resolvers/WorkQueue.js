let work = []
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

async function runWork(workId) {
  await snooze(3000)
  work[workId].stage = 'Done'
}

module.exports = {
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
    stats: ({ id }) => [],
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
