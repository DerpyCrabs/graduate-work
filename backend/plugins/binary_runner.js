const runPlugin = (input, settings) => {
  const execSync = require('child_process').execSync

  let output = ''
  try {
    output = execSync(`chmod +x ${input.output} && ${input.output}`, {
      input: input.input,
      encoding: 'ascii'
    })
  } catch (e) {
    console.log(e)
  }
  return {
    output: { ...input, output: output.trim() },
    stats: [`ran ${settings.exec_file} file`]
  }
}

module.exports = function(module_holder) {
  module_holder['3'] = {
    enabled: true,
    name: 'Binary runner',
    stage: 'Running',
    version: '0.0.1',
    settings: { exec_file: './a.out', stats: 'true' },
    stats: [],
    runPlugin: runPlugin
  }
}
