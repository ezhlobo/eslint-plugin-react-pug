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
  ecmaVersion: 10,
  sourceType: 'module',
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions })

const buildUnusedMessage = name => `'${name}' PropType is defined but prop is never used`

const cases = [
  {
    name: 'Without Components',
    valid: [
      {
        code: `
          Component.propTypes = { test: PropTypes.string }
        `,
      },
      {
        code: `
          pug\`p Hello\`
        `,
      },
      {
        code: `
          export default function* () {}
        `,
      },
    ],
  },

  {
    name: 'Functional Component, Unused props',
    valid: [
      {
        code: `
          function Component(props) {
            console.log(props.name)
          }
          Component.propTypes = { name: PropTypes.string }
        `,
      },
      {
        code: `
          function Component(props) {
            console.log(props['name'])
          }
          Component.propTypes = { name: PropTypes.string }
        `,
      },
    ],
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

  {
    name: 'Functional Component, Unused props, Pug',
    valid: [
      {
        code: `
          function Component({ Component, ...args }) {
            pug\`
              - const check = args [ 'name']
              = args . test
              div(inAttr=args.inAttr)
              Component
              if props.condition > 10
                p nothing #{args.interpolation}
              each item in props.list.toArray()
                p nothing
            \`

            const { ...rest } = args

            pug\`
              = rest.extra
            \`
          }
          Component.propTypes = {
            name: PropTypes.string,
            test: PropTypes.bool,
            inAttr: PropTypes.string,
            Component: PropTypes.node,
            condition: PropTypes.number,
            interpolation: PropTypes.string,
            list: PropTypes.object,
            extra: PropTypes.string,
          }
        `,
      },
    ],
  },
]

ruleTester.run('rule "eslint"', rule, buildCases(cases))
