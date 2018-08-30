/**
 * @fileoverview Tests for no-interpolation
 * @author Eugene Zhlobo
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const eslint = require('eslint')
const buildError = require('../../../lib/util/testBuildError')

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
      errors: [
        buildError([3, 15], [3, 25], MESSAGE),
        buildError([3, 26], [3, 36], MESSAGE),
      ],
    },
    {
      code: `
        pug\`
          div before \${example} after
        \`
      `,
      errors: [
        buildError([3, 22], [3, 32], MESSAGE),
      ],
    },
    {
      code: `
        pug\`
          div before \${  long_variable  +  something_else  } after
        \`
      `,
      errors: [
        buildError([3, 22], [3, 61], MESSAGE),
      ],
    },
    {
      code: `
        pug\`
          each item in \${ items }
            p= items
        \`
      `,
      errors: [
        buildError([3, 24], [3, 34], MESSAGE),
      ],
    },
    {
      code: `
        pug\`div= \${ example }\`
      `,
      errors: [
        buildError([2, 18], [2, 30], MESSAGE),
      ],
    },
  ],
})
