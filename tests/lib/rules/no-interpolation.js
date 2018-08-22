/**
 * @fileoverview Tests for no-interpolation
 * @author Eugene Zhlobo
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const eslint = require('eslint')

const { RuleTester } = eslint

const rule = require('../../../lib/rules/no-interpolation')

const parserOptions = {
  sourceType: 'module',
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions })

const MESSAGE = 'Don\'t use JavaScript interpolation'

ruleTester.run('rule "no-interpolation"', rule, {
  valid: [
    { code: 'pug`div #{test}`' },
  ],
  invalid: [
    {
      code: `
        pug\`
          div \${ long_variable + something_else }
          each item in \${ items }
            p= item
            p \${third}
        \`
      `,
      errors: [{
        message: MESSAGE,
        line: 3,
        column: 11,
        endLine: 3,
        endColumn: 51,
      }, {
        message: MESSAGE,
        line: 4,
        column: 11,
        endLine: 4,
        endColumn: 35,
      }, {
        message: MESSAGE,
        line: 6,
        column: 13,
        endLine: 6,
        endColumn: 24,
      }],
    },
  ],
})
