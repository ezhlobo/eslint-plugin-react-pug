/**
 * @fileoverview Tests for no-undef
 * @author Eugene Zhlobo
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const eslint = require('eslint')
const ruleNoUndef = require('eslint/lib/rules/no-undef')
const buildError = require('../../../lib/util/testBuildError')

const { RuleTester } = eslint

const rule = require('../../../lib/rules/no-undef')

const parserOptions = {
  ecmaVersion: 8,
  sourceType: 'module',
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
      errors: [
        buildError([1, 41], [1, 44], '\'App\' is not defined.'),
      ],
    },
    {
      code: '/*global pug*//*eslint no-undef:1*/ pug`= app`;',
      errors: [
        buildError([1, 43], [1, 46], '\'app\' is not defined.'),
      ],
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
      errors: [
        buildError([6, 15], [6, 23], '\'variable\' is not defined.'),
      ],
    },
    {
      code: `/*global pug*//*eslint no-undef:1*/
        pug\`
          each upValue, upKey in ['a', 'b']
          = upValue
          = upKey
        \`
      `,
      errors: [
        buildError([4, 13], [4, 20], '\'upValue\' is not defined.'),
        buildError([5, 13], [5, 18], '\'upKey\' is not defined.'),
      ],
    },
  ],
})
