/**
 * @fileoverview Tests for uses-react
 * @author Eugene Zhlobo
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const eslint = require('eslint')
const buildError = require('../../../lib/util/testBuildError')
const buildCases = require('../../../lib/util/testBuildCases')

const { RuleTester } = eslint

const rule = require('../../../lib/rules/prop-types')

const parserOptions = {
  ecmaVersion: 8,
  sourceType: 'module',
  ecmaFeatures: {
    experimentalObjectRestSpread: true,
  },
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions })

const buildUnusedMessage = name => `'${name}' PropType is defined but prop is never used`

const cases = [
  {
    name: 'Functional Component, Unused props',
    valid: {
      code: `
        function Component(props) {
          console.log(props.name)
        }
        Component.propTypes = { name: PropTypes.string }
      `,
    },
    invalid: {
      code: `
        function Component(props) {
          console.log(props)
        }
        Component.propTypes = { name: PropTypes.string, second: PropTypes.bool }
      `,
      errors: [
        buildError([5, 33], [5, 37], buildUnusedMessage('name')),
        buildError([5, 57], [5, 63], buildUnusedMessage('second')),
      ],
    },
  },

  {
    name: 'Functional Component, Unused props, spreading',
    valid: [
      {
        code: `
          function Component(props) {
            const { name, ...rest } = props

            console.log(rest.test)
          }
          Component.propTypes = { name: PropTypes.string, test: PropTypes.bool }
        `,
      },
      {
        code: `
          function Component(props) {
            const { ...rest } = props
            const { ...secondRest } = rest

            console.log(secondRest.name, rest.test)
          }
          Component.propTypes = { name: PropTypes.string, test: PropTypes.bool }
        `,
      },
    ],
    invalid: [
      {
        code: `
          function Component(props) {
            const { name, ...rest } = props
          }
          Component.propTypes = { name: PropTypes.string, test: PropTypes.bool }
        `,
        errors: [
          buildError([5, 59], [5, 63], buildUnusedMessage('test')),
        ],
      },
      {
        code: `
          function Component(props) {
            const { ...rest } = props
            const { ...secondRest } = rest
          }
          Component.propTypes = { name: PropTypes.string, test: PropTypes.bool }
        `,
        errors: [
          buildError([6, 35], [6, 39], buildUnusedMessage('name')),
          buildError([6, 59], [6, 63], buildUnusedMessage('test')),
        ],
      },
    ],
  },
]

ruleTester.run('rule "eslint"', rule, buildCases(cases))
