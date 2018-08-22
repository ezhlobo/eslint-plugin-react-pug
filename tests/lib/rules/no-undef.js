/**
 * @fileoverview Tests for no-undef
 * @author Eugene Zhlobo
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const eslint = require('eslint')
const ruleNoUndef = require('eslint/lib/rules/no-undef')

const { RuleTester } = eslint

const rule = require('../../../lib/rules/no-undef')

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
linter.defineRule('no-undef', ruleNoUndef)

ruleTester.run('rule "no-undef"', rule, {
  valid: [
    { code: '/*global pug*//*eslint no-undef:1*/ var App; pug`App`;' },
    { code: '/*global pug*//*eslint no-undef:1*/ var App; pug`p test`;' },
    {
      code: '/*global pug*//*eslint no-undef:1*/ pug`Global`',
      globals: { Global: true },
    },
    {
      code: `/*global pug*//*eslint no-undef:1*/
        pug\`
          p
            - const variable = 'variable'
            = variable
        \`
      `,
    },
    {
      code: `/*global pug*//*eslint no-undef:1*/
        pug\`
          each upValue, upKey in ['a', 'b']
            each downValue, downKey in ['a', 'b']
              = downValue
              = downKey
              = upValue
              = upKey
        \`
      `,
    },
    {
      code: `/*global pug*//*eslint no-undef:1*/
        pug\`
          div(data-test=\${false ? 'one' : 'two'})
        \`
      `,
    },
  ],
  invalid: [
    {
      code: '/*global pug*//*eslint no-undef:1*/ pug`App`;',
      errors: [{
        message: '\'App\' is not defined.',
        line: 1,
        column: 41,
        endLine: 1,
        endColumn: 44,
      }],
    },
    {
      code: '/*global pug*//*eslint no-undef:1*/ pug`= app`;',
      errors: [{
        message: '\'app\' is not defined.',
        line: 1,
        column: 43,
        endLine: 1,
        endColumn: 46,
      }],
    },
    {
      code: `/*global pug*//*eslint no-undef:1*/
        pug\`
          p
            nested
              - const variable = 'variable'
            = variable
        \`
      `,
      errors: [{
        message: '\'variable\' is not defined.',
        line: 6,
        column: 15,
        endLine: 6,
        endColumn: 23,
      }],
    },
    {
      code: `/*global pug*//*eslint no-undef:1*/
        pug\`
          each upValue, upKey in ['a', 'b']
          = upValue
          = upKey
        \`
      `,
      errors: [{
        message: '\'upValue\' is not defined.',
        line: 4,
        column: 13,
        endLine: 4,
        endColumn: 20,
      }, {
        message: '\'upKey\' is not defined.',
        line: 5,
        column: 13,
        endLine: 5,
        endColumn: 18,
      }],
    },
  ],
})
