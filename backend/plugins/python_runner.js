const runPlugin = (input, settings) => {
  return {
    output: input + ' run by binary runner',
    stats: [`ran ${settings.exec_file} file`]
  }
}

module.exports = function(module_holder) {
  module_holder['6'] = {
    enabled: true,
    name: 'Python runner',
    stage: 'Running',
    version: '0.0.1',
    settings: { stats: true },
    stats: [],
    runPlugin: runPlugin
  }
}
