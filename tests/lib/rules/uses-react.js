/**
 * @fileoverview Prevent React to be marked as unused
 * @author Eugene Zhlobo
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const eslint = require('eslint')
const ruleNoUnusedVars = require('eslint/lib/rules/no-unused-vars')

const { RuleTester } = eslint

const rule = require('../../../lib/rules/uses-react')

const parserOptions = {
  ecmaVersion: 8,
  sourceType: 'module',
  ecmaFeatures: {
    experimentalObjectRestSpread: true,
  },
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions })

const linter = ruleTester.linter || eslint.linter
linter.defineRule('uses-react', rule)

ruleTester.run('rule "uses-react"', ruleNoUnusedVars, {
  valid: [
    { code: '/*eslint uses-react:1*/ var React; pug``;' },
    { code: '/*eslint uses-react:1*/ var React; (function() { return pug``; })()' },
    { code: '/*eslint uses-react:1*/ var React; class Component {render() { return pug``; }}; new Component();' },
  ],
  invalid: [
    {
      code: '/*eslint uses-react:1*/ var React;',
      errors: [{ message: '\'React\' is defined but never used.' }],
    },
  ],
})
