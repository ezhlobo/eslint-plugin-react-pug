const assert = require('assert')
const fs = require('fs')
const path = require('path')

const plugin = require('../index.js')

const ruleFiles = fs.readdirSync(path.resolve(__dirname, '..', 'lib', 'rules'))
  .map(file => path.basename(file, '.js'))

describe('plugin\'s configuration', () => {
  it('exports rules', () => {
    assert(plugin.rules)
  })

  it('exports default config', () => {
    assert(plugin.configs.all)
  })

  describe('where default config', () => {
    it('contains "pug" in globals', () => {
      assert.deepEqual(plugin.configs.all.globals, {
        pug: true,
      })
    })

    it('contains only prefixed rule names', () => {
      Object.keys(plugin.configs.all.rules).forEach((ruleName) => {
        assert.equal(ruleName.indexOf('react-pug/'), 0)
      })
    })

    it('contains only errorable rules', () => {
      const values = Object.keys(plugin.configs.all.rules)
        .map(key => plugin.configs.all.rules[key])

      assert(values.every(value => value === 2))
    })

    it('contains all rules', () => {
      const rules = Object.keys(plugin.configs.all.rules)
      ruleFiles.forEach((ruleName) => {
        assert(rules.indexOf(`react-pug/${ruleName}`) > -1)
      })
    })
  })
})
