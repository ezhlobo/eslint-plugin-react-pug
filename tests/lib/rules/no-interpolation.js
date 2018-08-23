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
    { code: 'pug`div= test`' },
    { code: 'pug`div(attr=test)`' },
    { code: 'pug`div(attr=one + two)`' },
  ],
  invalid: [
    {
      code: `
        pug\`
          div \${example} \${example}
        \`
      `,
      errors: [{
        message: MESSAGE,
        line: 3,
        column: 15,
        endLine: 3,
        endColumn: 25,
      }, {
        message: MESSAGE,
        line: 3,
        column: 26,
        endLine: 3,
        endColumn: 36,
      }],
    },
    {
      code: `
        pug\`
          div before \${example} after
        \`
      `,
      errors: [{
        message: MESSAGE,
        line: 3,
        column: 22,
        endLine: 3,
        endColumn: 32,
      }],
    },
    {
      code: `
        pug\`
          div before \${  long_variable  +  something_else  } after
        \`
      `,
      errors: [{
        message: MESSAGE,
        line: 3,
        column: 22,
        endLine: 3,
        endColumn: 61,
      }],
    },
    {
      code: `
        pug\`
          each item in \${ items }
            p= items
        \`
      `,
      errors: [{
        message: MESSAGE,
        line: 3,
        column: 24,
        endLine: 3,
        endColumn: 34,
      }],
    },
    {
      code: `
        pug\`div= \${ example }\`
      `,
      errors: [{
        message: MESSAGE,
        line: 2,
        column: 18,
        endLine: 2,
        endColumn: 30,
      }],
    },
  ],
})
