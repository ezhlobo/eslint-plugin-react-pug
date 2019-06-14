/**
 * @fileoverview Tests for pug-lint
 * @author Eugene Zhlobo
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const eslint = require('eslint')
const buildError = require('../../../lib/util/testBuildError')
const buildCases = require('../../../lib/util/testBuildCases')

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

const buildIndentationMessage = actual => (
  `Invalid indentation, found "${actual}" spaces`
)

const cases = [
  {
    name: 'Attribute separator, single line',
    options: [{
      validateAttributeSeparator: {
        separator: ' ',
        multiLineSeparator: '\n  ',
      },
    }],
    valid: {
      code: `
        const ref = 'hello'
        pug\`
          div(...spread bool variable=ref number=0 string="string" object={a:true} array=[1, 'second'])
          div(
            ...spread bool variable=ref number=0 string="string" object={a:true} array=[1, 'second']
          )
        \`
      `,
    },
    invalid: {
      code: `
        const ref = 'hello'
        pug\`
          div(...spread  bool  variable=ref  number=0  string="string"  object={a:true}  array=[1, 'second'])
          div(
            ...spread  bool  variable=ref  number=0  string="string"  object={a:true}  array=[1, 'second']
          )
        \`
      `,
      errors: [
        buildError([4, 24], [4, 24], 'Invalid attribute separator found'),
        buildError([4, 30], [4, 30], 'Invalid attribute separator found'),
        buildError([4, 44], [4, 44], 'Invalid attribute separator found'),
        buildError([4, 54], [4, 54], 'Invalid attribute separator found'),
        buildError([4, 71], [4, 71], 'Invalid attribute separator found'),
        buildError([4, 88], [4, 88], 'Invalid attribute separator found'),
        buildError([6, 22], [6, 22], 'Invalid attribute separator found'),
        buildError([6, 28], [6, 28], 'Invalid attribute separator found'),
        buildError([6, 42], [6, 42], 'Invalid attribute separator found'),
        buildError([6, 52], [6, 52], 'Invalid attribute separator found'),
        buildError([6, 69], [6, 69], 'Invalid attribute separator found'),
        buildError([6, 86], [6, 86], 'Invalid attribute separator found'),
      ],
    },
  },

  {
    name: 'Attribute separator, multiline',
    options: [{
      validateAttributeSeparator: {
        separator: ' ',
        multiLineSeparator: '\n  ',
      },
    }],
    valid: {
      code: `
        pug\`
          div(
            bool
            variable=ref
            number=0
            string="string"
            object={a:true}
            array=[1, 'second']
          )
        \`
      `,
    },
    invalid: {
      code: `
        pug\`
          div(
            ...props,
            bool
             variable=ref
            , number=0
            string="string"
            object={a:true}
            array=[1, 'second']
          )
        \`

        pug\`div Hello\`
      `,
      errors: [
        buildError([5, 9], [5, 9], 'Invalid attribute separator found'),
        buildError([6, 10], [6, 10], 'Invalid attribute separator found'),
        buildError([7, 10], [7, 10], 'Invalid attribute separator found'),
      ],
    },
  },

  {
    name: 'Indentation',
    options: [{
      validateIndentation: 2,
    }],
    valid: {
      code: `
        export default () => pug\`
          div
            div: div
        \`
      `,
    },
    invalid: {
      code: `
        export default () => pug\`
          div
           div
        \`

        const test = pug\`
         div
        \`

        pug\`
           div
            p
        \`

          pug\`
             div
          \`
      `,
      errors: [
        buildError([4, 1], [4, 12], buildIndentationMessage(11)),
        buildError([8, 1], [8, 10], buildIndentationMessage(9)),
        buildError([12, 1], [12, 12], buildIndentationMessage(11)),
        buildError([17, 1], [17, 14], buildIndentationMessage(13)),
      ],
    },
  },
]

ruleTester.run('rule "pug-lint"', rule, buildCases(cases))
