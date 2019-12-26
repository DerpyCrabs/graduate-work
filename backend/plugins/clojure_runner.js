const runPlugin = (input, settings) => {
  const execSync = require('child_process').execSync
  const fileSync = require('tmp').fileSync
  const fs = require('fs')

  let tmpobj = fileSync({ postfix: '.clj' })
  fs.writeSync(tmpobj.fd, input.code)
  fs.closeSync(tmpobj.fd)
  let output = ''
  try {
    output = execSync(`clojure ${tmpobj.name}`, {
      input: input.input,
      encoding: 'ascii'
    })
  } catch (e) {
    console.log(e)
  }
  return {
    output: { ...input, output: output.trim() },
    stats: [`ran clojure file`]
  }
}

module.exports = function(module_holder) {
  module_holder['5'] = {
    enabled: true,
    name: 'Clojure runner',
    stage: 'Running',
    version: '0.0.1',
    settings: { stats: true },
    stats: [],
    runPlugin: runPlugin
  }
}
