const runPlugin = (input, settings) => {
  const execSync = require('child_process').execSync
  const fileSync = require('tmp').fileSync
  const fs = require('fs')

  let tmpobj = fileSync({ postfix: '.py' })
  fs.writeSync(tmpobj.fd, input.code)
  fs.closeSync(tmpobj.fd)
  let output = ''
  try {
    output = execSync(`python ${tmpobj.name}`, {
      input: input.input,
      encoding: 'ascii'
    })
  } catch (e) {
    console.log(e)
  }

  return {
    output: { ...input, output: output.trim() },
    stats: [`ran python file`]
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
