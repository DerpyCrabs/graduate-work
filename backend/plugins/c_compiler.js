const runPlugin = (input, settings) => {
  return {
    output: input + ' compiled by C compiler',
    stats: [`compiled c file with flags ${settings.flags}`]
  }
}

module.exports = function(module_holder) {
  module_holder['1'] = {
    enabled: true,
    name: 'C compiler',
    stage: 'Compilation',
    version: '0.0.1',
    settings: { flags: '-O0' },
    stats: [],
    runPlugin: runPlugin
  }
}
