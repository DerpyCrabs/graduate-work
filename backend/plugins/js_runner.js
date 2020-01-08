const runPlugin = (input, settings) => {
  const execSync = require('child_process').execSync
  const fileSync = require('tmp').fileSync
  const fs = require('fs')

  let tmpobj = fileSync({ postfix: '.js' })
  fs.writeSync(tmpobj.fd, input.code)
  fs.closeSync(tmpobj.fd)

  let output = ''
  try {
    output = execSync(`node ${tmpobj.name}`, {
      input: input.input,
      encoding: 'ascii'
    })
  } catch (e) {
    console.log(e)
  }

  return {
    output: { ...input, output: output.trim() },
    stats: [`ran js file with ${settings.node_binary} binary`]
  }
}

module.exports = function(module_holder) {
  module_holder['2'] = {
    enabled: true,
    name: 'JS runner',
    stage: 'Running',
    version: '0.0.1',
    settings: { node_binary: 'node' },
    stats: [],
    runPlugin: runPlugin
  }
}
