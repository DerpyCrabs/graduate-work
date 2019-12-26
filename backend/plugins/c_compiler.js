const runPlugin = (input, settings) => {
  const execSync = require('child_process').execSync
  const fileSync = require('tmp').fileSync
  const nameSync = require('tmp').tmpNameSync
  const fs = require('fs')

  let tmpobj = fileSync({ postfix: '.c' })
  fs.writeSync(tmpobj.fd, input.code)
  fs.closeSync(tmpobj.fd)
  let out = nameSync()
  try {
    output = execSync(`g++ -o ${out} ${tmpobj.name}`, {
      encoding: 'ascii'
    })
  } catch (e) {
    console.log(e)
  }
  return {
    output: { ...input, output: out },
    stats: [`compiled c file with flags ${settings.flags}`]
  }
}

module.exports = function(module_holder) {
  module_holder['1'] = {
    enabled: true,
    name: 'C compiler',
    stage: 'Compilation',
    version: '0.0.1',
    settings: { flags: '-O0', stats: 'true' },
    stats: [],
    runPlugin: runPlugin
  }
}
