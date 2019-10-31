const { host, username, password, database } = require('./config')
const { Pool } = require('pg')

let pool = new Pool({ host, user: username, database })

module.exports = {
  query: (path, args) => pool.query(path, args).then(data => data.rows),
  queryFile: (path, args) =>
    pool
      .query(require('fs').readFileSync(path, 'utf8'), args)
      .then(data => data.rows)
}
