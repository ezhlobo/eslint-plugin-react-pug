/**
 * @fileoverview Tests for pug-lint
 * @author Eugene Zhlobo
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const eslint = require('eslint')
const buildError = require('../../../lib/util/testBuildError')

const { RuleTester } = eslint

const rule = require('../../../lib/rules/pug-lint')

const parserOptions = {
  ecmaVersion: 8,
  sourceType: 'module',
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions })

ruleTester.run('rule "pug-lint"', rule, {
  valid: [
    {
      code: `
        pug\`p(id="hello")\`;
      `,
    },
    {
      options: [{
        disallowIdAttributeWithStaticValue: true,
      }],
      code: `
        pug\`p#hello\`;
      `,
    },
  ],
  invalid: [
    {
      options: [{
        disallowIdAttributeWithStaticValue: true,
      }],
      code: `
        pug\`
          p(id="hello")
        \`;
      `,
      errors: [
        buildError([3, 13], [3, 13], 'Static attribute "id" must be written as ID literal'),
      ],
    },
    {
      options: [{
        disallowIdAttributeWithStaticValue: true,
      }],
      code: `
        pug\`
          p(id="hello")
          p(id="hello")
        \`;
      `,
      errors: [
        buildError([3, 13], [3, 13], 'Static attribute "id" must be written as ID literal'),
        buildError([4, 13], [4, 13], 'Static attribute "id" must be written as ID literal'),
      ],
    },
    {
      options: [{
        disallowIdAttributeWithStaticValue: true,
      }],
      code: `
        pug\`p(id="hello")\`;
      `,
      errors: [
        buildError([2, 16], [2, 16], 'Static attribute "id" must be written as ID literal'),
      ],
    },
    {
      options: [{
        disallowIdAttributeWithStaticValue: true,
      }],
      code: `
        pug\`p(id="hello")\`;
        pug\`p(id="hello")\`;
      `,
      errors: [
        buildError([2, 16], [2, 16], 'Static attribute "id" must be written as ID literal'),
        buildError([3, 16], [3, 16], 'Static attribute "id" must be written as ID literal'),
      ],
    },
  ],
})
