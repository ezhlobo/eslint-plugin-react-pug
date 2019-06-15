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
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions })

const cases = [
  {
    name: 'Basic',
    valid: {
      code: `
        function Component(props) {
          return props.name
        }
        Component.propTypes = { name: PropTypes.string }
      `,
    },
    invalid: {
      code: ``,
      errors: [],
    },
  },
]

ruleTester.run('rule "eslint"', rule, buildCases(cases))
