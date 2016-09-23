var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  ACCESS_TOKEN: `"${process.env.ACCESS_TOKEN}"`
})
