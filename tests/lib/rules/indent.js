/**
 * @fileoverview Tests for indent
 * @author Eugene Zhlobo
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const eslint = require('eslint')

const { RuleTester } = eslint

const rule = require('../../../lib/rules/indent')

const parserOptions = {
  ecmaVersion: 8,
  sourceType: 'module',
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions })

const buildMessage = (expected, actual) => (
  `Expected indentation of ${expected} spaces but found ${actual}`
)

ruleTester.run('rule "indent"', rule, {
  valid: [
    { code: 'pug`div`' },
    {
      code: `
        pug\`
          div
            div:  div
            div
              div
        \`
      `,
    },
  ],
  invalid: [
    {
      code: `
        pug\`
test
        \`
      `,
      errors: [{
        message: buildMessage(10, 0),
        line: 3,
        column: 1,
        endLine: 3,
        endColumn: 1,
      }],
    },
    {
      code: `
        pug\`
         test
        \`
      `,
      errors: [{
        message: buildMessage(10, 9),
        line: 3,
        column: 1,
        endLine: 3,
        endColumn: 10,
      }],
    },
    {
      code: `
        pug\`
           div
        \`
      `,
      errors: [{
        message: buildMessage(10, 11),
        line: 3,
        column: 1,
        endLine: 3,
        endColumn: 12,
      }],
    },
    {
      code: `
          pug\`
             div
          \`
      `,
      errors: [{
        message: buildMessage(12, 13),
        line: 3,
        column: 1,
        endLine: 3,
        endColumn: 14,
      }],
    },
    {
      code: `
        pug\`
          div
            div
              div
          div
           div
        \`
      `,
      errors: [{
        message: buildMessage(12, 11),
        line: 7,
        column: 1,
        endLine: 7,
        endColumn: 12,
      }],
    },
    {
      code: `
        pug\`
          div
            div
             div(incorrect)
              p
             div(incorrect)
        \`
      `,
      errors: [{
        message: buildMessage(14, 13),
        line: 5,
        column: 1,
        endLine: 5,
        endColumn: 14,
      }, {
        message: buildMessage(16, 14),
        line: 6,
        column: 1,
        endLine: 6,
        endColumn: 15,
      }],
    },
    {
      code: `
        pug\`
            div
                div
        \`
      `,
      errors: [{
        message: buildMessage(10, 12),
        line: 3,
        column: 1,
        endLine: 3,
        endColumn: 13,
      }, {
        message: buildMessage(12, 16),
        line: 4,
        column: 1,
        endLine: 4,
        endColumn: 17,
      }],
    },
  ],
})
