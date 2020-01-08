const runPlugin = (input, settings) => {
  return {
    output: { ...input, result: `${input.output === input.expected}` },
    stats: [`checked ${input.output} against ${input.expected}`]
  }
}

module.exports = function(module_holder) {
  module_holder['4'] = {
    enabled: true,
    name: 'Exact output checker',
    stage: 'Testing',
    version: '0.0.1',
    settings: { out: 'text ran js file with node binary', stats: 'true' },
    stats: [],
    runPlugin: runPlugin
  }
}
