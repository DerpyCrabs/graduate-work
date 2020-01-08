const runPlugin = (input, settings) => {
  const execSync = require('child_process').execSync
  const fileSync = require('tmp').fileSync
  const nameSync = require('tmp').tmpNameSync
  const fs = require('fs')

  let tmpobj = fileSync({ postfix: '.rs' })
  fs.writeSync(tmpobj.fd, input.code)
  fs.closeSync(tmpobj.fd)
  let out = nameSync()
  try {
    output = execSync(`rustc -o ${out} ${tmpobj.name}`, {
      encoding: 'ascii'
    })
  } catch (e) {
    console.log(e)
  }
  return {
    output: { ...input, output: out },
    stats: [`compiled rust file with flags ${settings.flags}`]
  }
}

module.exports = function(module_holder) {
  module_holder['7'] = {
    enabled: true,
    name: 'Rust compiler',
    stage: 'Compiling',
    version: '0.0.1',
    settings: { stats: 'true' },
    stats: [],
    runPlugin: runPlugin
  }
}
