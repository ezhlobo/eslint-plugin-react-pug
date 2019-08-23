/**
 * @fileoverview Tests for no-broken-template
 * @author Eugene Zhlobo
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const eslint = require('eslint')
const buildError = require('../../../lib/util/testBuildError')

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
    {
      code: `
        pug\`
          button(type="button" ...props)
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
      errors: [
        buildError([5, 13], [5, 31], 'Pug can\'t parse this template'),
      ],
    },
    {
      code: `
        pug\`
          p good string
          div
            each i in [1, 2, 3
        \`;
      `,
      errors: [
        buildError([5, 13], [5, 31], 'Pug can\'t parse this template'),
      ],
    },
    {
      code: `pug\`
        Component(
          iam-object= a: 1, b: 2 }
        )
      \`;`,
      errors: [
        buildError([3, 11], [3, 35], 'Pug can\'t parse this template'),
      ],
    },
    {
      code: `pug\`
        Component(
          iam-object={ a: 1, b: 2
        )
      \`;`,
      errors: [
        buildError([4, 9], [4, 10], 'Pug can\'t parse this template'),
      ],
    },
    {
      code: `pug\`
        div
          div
         div
      \``,
      errors: [
        buildError([4, 10], [4, 13], 'Pug can\'t parse this template'),
      ],
    },
  ],
})
