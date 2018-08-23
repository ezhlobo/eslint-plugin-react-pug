const assert = require('assert')
const fs = require('fs')
const path = require('path')

const { docsUrl } = require('../lib/util/eslint')

const ruleFiles = fs.readdirSync(path.resolve(__dirname, '..', 'lib', 'rules'))
  .map(file => path.basename(file, '.js'))

describe('each rule', () => {
  describe('has url to documentation', () => {
    ruleFiles.forEach((ruleName) => {
      it(ruleName, () => {
        const filepath = path.resolve(__dirname, '..', 'lib', 'rules', `${ruleName}.js`)

        // eslint-disable-next-line global-require, import/no-dynamic-require
        const file = require(filepath)

        assert.equal(file.meta.docs.url, docsUrl(ruleName))
      })
    })
  })

  describe('mentioned in README', () => {
    const listOfRulesInReadme = fs
      .readFileSync(path.resolve(__dirname, '..', 'README.md'), 'utf-8')
      .match(/## List of supported rules\n+((\*.+\n+)+)/m)[1]
      .split('\n')
      .filter(Boolean)

    ruleFiles.forEach((ruleName) => {
      it(ruleName, () => {
        const checker = new RegExp(`^\\* \\[\`react-pug/${ruleName}\`\\]\\(\\./docs/rules/${ruleName}.md\\): .+$`)

        const isPresented = listOfRulesInReadme
          .find(item => checker.test(item))

        assert(isPresented)
      })
    })
  })
})
