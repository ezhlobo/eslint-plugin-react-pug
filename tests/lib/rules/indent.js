/**
 * @fileoverview Tests for indent
 * @author Eugene Zhlobo
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const eslint = require('eslint')
const buildError = require('../../../lib/util/testBuildError')

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
    {
      code: `
        const example = pug\`
          div
            div: div
        \`
      `,
    },
    {
      code: `
        export default () => pug\`
          div
            div: div
        \`
      `,
    },
    {
      code: `
        export default () => {
          return pug\`
            div
              div: div
          \`
        }
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
      errors: [
        buildError([3, 1], [3, 1], buildMessage(10, 0)),
      ],
    },
    {
      code: `
        pug\`
         test
        \`
      `,
      errors: [
        buildError([3, 1], [3, 10], buildMessage(10, 9)),
      ],
    },
    {
      code: `
        pug\`
           div
        \`
      `,
      errors: [
        buildError([3, 1], [3, 12], buildMessage(10, 11)),
      ],
    },
    {
      code: `
          pug\`
             div
          \`
      `,
      errors: [
        buildError([3, 1], [3, 14], buildMessage(12, 13)),
      ],
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
      errors: [
        buildError([7, 1], [7, 12], buildMessage(12, 11)),
      ],
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
      errors: [
        buildError([5, 1], [5, 14], buildMessage(14, 13)),
        buildError([6, 1], [6, 15], buildMessage(16, 14)),
      ],
    },
    {
      code: `
        pug\`
            div
                div
        \`
      `,
      errors: [
        buildError([3, 1], [3, 13], buildMessage(10, 12)),
        buildError([4, 1], [4, 17], buildMessage(12, 16)),
      ],
    },
    {
      code: `
        function asd() {
          const result = pug\`
             div
               div
          \`
        }
      `,
      errors: [
        buildError([4, 1], [4, 14], buildMessage(12, 13)),
        buildError([5, 1], [5, 16], buildMessage(14, 15)),
      ],
    },
  ],
})
