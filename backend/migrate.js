const { query } = require('./db')
var fs = require('fs')

query(fs.readFileSync(process.argv[2], 'utf8'), process.argv.slice(3)).then(
  console.log
)
