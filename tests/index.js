const assert = require('assert')

const plugin = require('../index.js')

describe('plugin\'s configuration', () => {
  it('exports rules', () => {
    assert(plugin.rules)
  })

  it('exports default config', () => {
    assert(plugin.configs.all)
  })

  describe('exports default config which', () => {
    it('returns "pug" in globals', () => {
      assert.deepEqual(plugin.configs.all.globals, {
        pug: true,
      })
    })

    it('returns all rules', () => {
      assert.deepEqual(plugin.configs.all.rules, {

      })
    })
  })
})
