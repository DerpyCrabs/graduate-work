const runPlugin = (input, settings) => {
  return {
    output: input + ' run by binary runner',
    stats: [`ran ${settings.exec_file} file`]
  }
}

module.exports = function(module_holder) {
  module_holder['7'] = {
    enabled: true,
    name: 'Rust compiler',
    stage: 'Compiling',
    version: '0.0.1',
    settings: { stats: true },
    stats: [],
    runPlugin: runPlugin
  }
}
