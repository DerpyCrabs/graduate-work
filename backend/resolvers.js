const WorkQueue = require('./resolvers/WorkQueue')
const Auth = require('./resolvers/Auth')
const merge = require('lodash.merge')

const resolvers = merge(WorkQueue, Auth)

module.exports = resolvers
