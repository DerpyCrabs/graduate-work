let work = []
const snooze = ms => new Promise(resolve => setTimeout(resolve, ms))

let plugins = {
  '1': {
    enabled: true,
    name: 'C compiler',
    stage: 'Compilation',
    version: '0.0.1',
    settings: { flags: '-O0' }
  },
  '2': {
    enabled: true,
    name: 'JS runner',
    stage: 'Running',
    version: '0.0.1',
    settings: { node_binary: 'node' }
  },
  '3': {
    enabled: true,
    name: 'Binary runner',
    stage: 'Running',
    version: '0.0.1',
    settings: { exec_file: './a.out' }
  }
}
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
      return work.length - 1
    },
    check_work_result: (_, { id }) => {
      return work[id].stage === 'Done'
    }
  }
}
