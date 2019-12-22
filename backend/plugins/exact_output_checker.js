const runPlugin = (input, settings) => {
  return {
    output: `${input === settings.out}`,
    stats: [`checked ${input} against ${settings.out}`]
  }
}

module.exports = function(module_holder) {
  module_holder['4'] = {
    enabled: true,
    name: 'Exact output checker',
    stage: 'Testing',
    version: '0.0.1',
    settings: { out: 'text ran js file with node binary' },
    stats: [],
    runPlugin: runPlugin
  }
}
