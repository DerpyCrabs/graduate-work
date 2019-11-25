const runPlugin = (input, settings) => {
  return {
    output: input + ' run by binary runner',
    stats: [`ran ${settings.exec_file} file`]
  }
}

module.exports = function(module_holder) {
  module_holder['3'] = {
    enabled: true,
    name: 'Binary runner',
    stage: 'Running',
    version: '0.0.1',
    settings: { exec_file: './a.out', stats: 'true' },
    stats: [],
    runPlugin: runPlugin
  }
}
