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
  ],
  invalid: [
    {
      code: '/*global pug*//*eslint no-undef:1*/ pug`App`;',
      errors: [{
        message: '\'App\' is not defined.',
      }],
    },
    {
      code: '/*global pug*//*eslint no-undef:1*/ pug`= app`;',
      errors: [{
        message: '\'app\' is not defined.',
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
      }, {
        message: '\'upKey\' is not defined.',
      }],
    },
  ],
})
