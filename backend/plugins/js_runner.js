const runPlugin = (input, settings) => {
  return { output: input, stats: [] }
}

module.exports = function(module_holder) {
  module_holder['2'] = {
    enabled: true,
    name: 'JS runner',
    stage: 'Running',
    version: '0.0.1',
    settings: { node_binary: 'node' }
  }
}
