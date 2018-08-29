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
    {
      code: `pug\`
        div
          Component(
            object={a: 1, b: 2}
          )
      \``,
    },
    {
      // eslint-disable-next-line no-template-curly-in-string
      code: 'pug`div(className=${variable})`',
    },
    {
      code: `
        pug\`
          div(className=\${false ? 'one' : 'two'})
          div(className=\${true})
        \`
      `,
    },
  ],
  invalid: [
    {
      code: `
        pug\`
          p good string
          div
            each i in 1, 2, 3]
        \`;
      `,
      errors: [{
        line: 5,
        column: 13,
        endLine: 5,
        endColumn: 31,
        message: 'Pug can\'t parse this template',
      }],
    },
    {
      code: `
        pug\`
          p good string
          div
            each i in [1, 2, 3
        \`;
      `,
      errors: [{
        line: 5,
        column: 13,
        endLine: 5,
        endColumn: 31,
        message: 'Pug can\'t parse this template',
      }],
    },
    {
      code: `pug\`
        Component(
          iam-object= a: 1, b: 2 }
        )
      \`;`,
      errors: [{
        line: 3,
        column: 11,
        endLine: 3,
        endColumn: 35,
        message: 'Pug can\'t parse this template',
      }],
    },
    {
      code: `pug\`
        Component(
          iam-object={ a: 1, b: 2
        )
      \`;`,
      errors: [{
        line: 4,
        column: 9,
        endLine: 4,
        endColumn: 10,
        message: 'Pug can\'t parse this template',
      }],
    },
    {
      code: `pug\`
        div
          div
         div
      \``,
      errors: [{
        line: 4,
        column: 10,
        endLine: 4,
        endColumn: 13,
        message: 'Pug can\'t parse this template',
      }],
    },
  ],
})
