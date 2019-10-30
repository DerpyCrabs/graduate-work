const { queryFile } = require('./db')
require('dotenv').config()
var fs = require('fs')

queryFile(process.argv[2], process.argv.slice(3)).then(console.log)
