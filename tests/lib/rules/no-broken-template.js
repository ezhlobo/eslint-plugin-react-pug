/**
 * @fileoverview Tests for no-broken-template
 * @author Eugene Zhlobo
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const eslint = require('eslint')

const { RuleTester } = eslint

const rule = require('../../../lib/rules/no-broken-template')

const parserOptions = {
  sourceType: 'module',
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions })

ruleTester.run('rule "no-broken-template"', rule, {
  valid: [
    { code: 'pug`p= variable`;' },
    { code: 'pug`Component`;' },
  ],
  invalid: [
    {
      code: `
        /*global pug*/
        pug\`
          p good string
          div
            each i in 1, 2, 3]
        \`;
      `,
      errors: [{
        line: 6,
        column: 13,
        endLine: 6,
        endColumn: 31,
        message: 'Pug can\'t parse this template',
      }],
    },
  ],
})
