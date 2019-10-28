const { host, username, password, database } = require('./config')
const { Pool } = require('pg')

let pool = new Pool({ host, user: username, password, database })

module.exports = {
  query: pool.query,
  queryFile: (path, args) =>
    pool.query(require('fs').readFileSync(path, 'utf8'), args)
}
