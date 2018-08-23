const assert = require('assert')
const fs = require('fs')
const path = require('path')

const { docsUrl } = require('../lib/util/eslint')

const ruleFiles = fs.readdirSync(path.resolve(__dirname, '..', 'lib', 'rules'))
  .map(file => path.basename(file, '.js'))

describe('URLs to documentation', () => {
  ruleFiles.forEach((ruleName) => {
    it(ruleName, () => {
      const filepath = path.resolve(__dirname, '..', 'lib', 'rules', `${ruleName}.js`)

      // eslint-disable-next-line global-require, import/no-dynamic-require
      const file = require(filepath)

      assert.equal(file.meta.docs.url, docsUrl(ruleName))
    })
  })
})
