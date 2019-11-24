const runPlugin = (input, settings) => {
  return { output: input, stats: [] }
}

module.exports = function(module_holder) {
  module_holder['3'] = {
    enabled: true,
    name: 'Binary runner',
    stage: 'Running',
    version: '0.0.1',
    settings: { exec_file: './a.out' }
  }
}
