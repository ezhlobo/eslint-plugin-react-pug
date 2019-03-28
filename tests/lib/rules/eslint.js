/**
 * @fileoverview Tests for uses-react
 * @author Eugene Zhlobo
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const eslint = require('eslint')
const buildError = require('../../../lib/util/testBuildError')

const { RuleTester } = eslint

const rule = require('../../../lib/rules/eslint')

const parserOptions = {
  ecmaVersion: 8,
  sourceType: 'module',
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions })

const cases = [
  {
    name: 'if, if-else',
    options: [{
      'space-infix-ops': 'error',
    }],
    valid: {
      code: `
        pug\`
          if this.method() > 1
            div big
          else if this.method() < -1
            div small
        \`
      `,
    },
    invalid: {
      code: `
        pug\`
          if this.method()>1
            div big
          else if this.method()< -1
            div small
        \`
      `,
      errors: [
        buildError([3, 27], [3, 27], 'Operator \'>\' must be spaced.'),
        buildError([5, 32], [5, 32], 'Operator \'<\' must be spaced.'),
      ],
    },
  },

  {
    name: 'Code',
    options: [{
      'object-curly-spacing': ['error', 'always'],
    }],
    valid: {
      code: `
        pug\`
          - const test = { one: true }
        \`
      `,
    },
    invalid: {
      code: `
        pug\`
          - const test = {one: true}
        \`
      `,
      errors: [
        buildError([3, 26], [3, 26], 'A space is required after \'{\'.'),
        buildError([3, 36], [3, 36], 'A space is required before \'}\'.'),
      ],
    },
  },

  {
    name: 'Each',
    options: [{
      'object-curly-spacing': ['error', 'always'],
    }],
    valid: {
      code: `
        pug\`
          each item in [{ one: true }]
            = item
        \`
      `,
    },
    invalid: {
      code: `
        pug\`
          each item in [{one: true}]
            = item
        \`
      `,
      errors: [
        buildError([3, 25], [3, 25], 'A space is required after \'{\'.'),
        buildError([3, 35], [3, 35], 'A space is required before \'}\'.'),
      ],
    },
  },

  {
    name: 'One line attribute',
    options: [{
      'comma-spacing': 'error',
      'no-multi-spaces': 'error',
    }],
    valid: {
      code: `
        pug\`
          div(data-value=getValueFor(one, two, three))
        \`
      `,
    },
    invalid: {
      code: `
        pug\`
          div(data-value=getValueFor(one,two,three,  four,   five))
        \`
      `,
      errors: [
        buildError([3, 41], [3, 42], 'A space is required after \',\'.'),
        buildError([3, 45], [3, 46], 'A space is required after \',\'.'),
        buildError([3, 54], [3, 54], 'Multiple spaces found before \'four\'.'),
        buildError([3, 62], [3, 62], 'Multiple spaces found before \'five\'.'),
      ],
    },
  },

  {
    name: 'Multi line attribute',
    options: [{
      'comma-dangle': ['error', 'always-multiline'],
      indent: ['error', 2],
    }],
    valid: {
      code: `
        pug\`
          div(
            className={
              test: true,
              selected: false,
            }
          )
        \`
      `,
    },
    invalid: {
      code: `
        pug\`
          div(
            className={
              test: true,
               selected: false
            }
          )
        \`
      `,
      errors: [
        buildError([6, 13], [6, 16], 'Expected indentation of 2 spaces but found 3.'),
        buildError([6, 31], [6, 31], 'Missing trailing comma.'),
      ],
    },
  },
]

const extractCase = (items, type) => items.map(item => ({
  options: item.options || [],
  ...item[type],
}))

ruleTester.run('rule "eslint"', rule, {
  valid: extractCase(cases, 'valid'),
  invalid: extractCase(cases, 'invalid'),
})
