const { queryFile } = require('./db')
var fs = require('fs')

queryFile(process.argv[2], process.argv.slice(3)).then(console.log)
