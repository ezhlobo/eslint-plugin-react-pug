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
  ecmaFeatures: {
    jsx: true,
  },
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
    name: 'Ignore Classes',
    valid: [
      {
        code: `
          class Test extends React.Component {
            render() {
              return pug\`\`
            }
          }
          Test.propTypes = { test: PropTypes.bool }
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
            const test = props.name
            return pug\`\`
          }
          Component.propTypes = { name: PropTypes.string }
        `,
      },
      {
        code: `
          function Component(props) {
            return pug\`= props[ 'name' ]\`
          }
          Component.propTypes = { name: PropTypes.string }
        `,
      },
      {
        code: `
          function Component(props) {
            return pug\`= props.name\`
          }
          Component.propTypes = { name: PropTypes.string }
        `,
      },
    ],
    invalid: [{
      code: `
        function Component(props) {
          console.log(props)
          return pug\`\`
        }
        Component.propTypes = { name: PropTypes.string, second: PropTypes.bool }
      `,
      errors: [
        buildError([6, 39], [6, 55], buildUnusedMessage('name')),
        buildError([6, 65], [6, 79], buildUnusedMessage('second')),
      ],
    }],
  },

  {
    name: 'Functional Component, Unused props, spreading',
    valid: [
      {
        code: `
          function Component(props) {
            const { name, ...rest } = props

            return pug\`= rest.test\`
          }
          Component.propTypes = { name: PropTypes.string, test: PropTypes.bool }
        `,
      },
      {
        code: `
          function Component(props) {
            const { ...rest } = props
            const { ...secondRest } = rest

            return pug\`
              = secondRest.name
              = rest.test
            \`
          }
          Component.propTypes = { name: PropTypes.string, test: PropTypes.bool }
        `,
      },
      {
        code: `
          function Component(props) {
            return pug\`div(...props)\`
          }
          Component.propTypes = { name: PropTypes.string }
        `,
      },
      {
        code: `
          function Component(props) {
            const rest = props
            return pug\`div(...rest)\`
          }
          Component.propTypes = { name: PropTypes.string }
        `,
      },
      {
        code: `
          function Component(props) {
            const rest = props
            return pug\`
              = rest.name
              = props.test
            \`
          }
          Component.propTypes = { name: PropTypes.string, test: PropTypes.string }
        `,
      },
    ],
    invalid: [
      {
        code: `
          function Component(props) {
            const { name, ...rest } = props
            return pug\`\`
          }
          Component.propTypes = { name: PropTypes.string, test: PropTypes.bool }
        `,
        errors: [
          buildError([6, 65], [6, 79], buildUnusedMessage('test')),
        ],
      },
      {
        code: `
          function Component(props) {
            const { ...rest } = props
            const { ...secondRest } = rest
            return pug\`\`
          }
          Component.propTypes = { name: PropTypes.string, test: PropTypes.bool }
        `,
        errors: [
          buildError([7, 41], [7, 57], buildUnusedMessage('name')),
          buildError([7, 65], [7, 79], buildUnusedMessage('test')),
        ],
      },
      {
        code: `
          function Component(props) {
            const rest = props
            return pug\`
              div(rest=rest props=props)
            \`
          }
          Component.propTypes = { name: PropTypes.string }
        `,
        errors: [
          buildError([8, 41], [8, 57], buildUnusedMessage('name')),
        ],
      },
    ],
  },

  {
    name: 'Functional Component, Unused props, Pug',
    valid: [
      {
        code: `
          function Component({ MyComponent }) {
            return pug\`
              div
            \`
          }
          Component.propTypes = { MyComponent: PropTypes.node }
        `,
      },
      {
        code: `
          function Component({ MyComponent, ...args }) {
            return pug\`
              div(...args)
            \`
          }
          Component.propTypes = { MyComponent: PropTypes.node, test: PropTypes.bool }
        `,
      },
      {
        code: `
          function Component({ Component, ...args }) {
            pug\`
              - const check = args [ 'name']
              = args . test
              div(inAttr=args.inAttr)
              Component
              if args.condition > 10
                p nothing #{args.interpolation}
              each item in args.list.toArray()
                p nothing
            \`

            const rest = args

            return pug\`
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
      {
        code: `
          function Component() {
            return pug\`
              Box and me, which adds some space to use multiple Boxes separated by meanings
            \`
          }
        `,
      },
      {
        code: `
          function Component(props) {
            return pug\`
              div
                = props.children
            \`
          }
          Component.propTypes = { children: PropTypes.node }
        `,
      },
      {
        code: `
          function Component(props) {
            if (props.one) {
              return pug\`
                div
                  = props.two
              \`
            }

            return pug\`
              div
                = props.three
            \`
          }
          Component.propTypes = {
            one: PropTypes.bool,
            two: PropTypes.node,
            three: PropTypes.node,
          }
        `,
      },
    ],
    invalid: [
      {
        code: `
          const props = { test: true }
          function Component(args) {
            return pug\`
              = props.test
            \`
          }
          Component.propTypes = { test: PropTypes.bool }
        `,
        errors: [
          buildError([8, 41], [8, 55], buildUnusedMessage('test')),
        ],
      },
    ],
  },

  {
    name: 'Variables, Unused props',
    valid: [
      {
        code: `
          const Component = (props) => {
            return pug\`
              div
                = props.children
            \`
          }
          Component.propTypes = { children: PropTypes.node }
        `,
      },
      {
        code: `
          const Component = function (props) {
            return pug\`
              div
                = props.children
            \`
          }
          Component.propTypes = { children: PropTypes.node }
        `,
      },
    ],
  },
]

ruleTester.run('rule "eslint"', rule, buildCases(cases))
