const { buildLocation } = require('./eslint')

module.exports = token => ({
  type: null,
  loc: buildLocation([-1, -1], [-1, -1]),
  ...token,
})
