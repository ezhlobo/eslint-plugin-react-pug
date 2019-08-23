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
const buildMissingMessage = name => `'${name}' is missing in props validation`

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
      {
        code: `
          function Component(props) {
            return pug\`
              div(
                values = {
                  item: props.name,
                }
              )
            \`
          }
          Component.propTypes = { name: PropTypes.string }
        `,
      },
    ],
    invalid: [
      {
        code: `
          function Component(props) {
            console.log(props)
            return pug\`\`
          }
          Component.propTypes = { name: PropTypes.string, second: PropTypes.bool }
        `,
        errors: [
          buildError([6, 41], [6, 57], buildUnusedMessage('name')),
          buildError([6, 67], [6, 81], buildUnusedMessage('second')),
        ],
      },
      {
        code: `
          function Component(props) {
            return pug\`
              div(
                values = {
                  item: props.name,
                }
              )
            \`
          }
        `,
        errors: [
          buildError([6, 31], [6, 35], buildMissingMessage('name')),
        ],
      },
      {
        code: `
          function Component(props) {
            return pug\`
              div(
                values = {  item: props.name
                }
              )
            \`
          }
        `,
        errors: [
          buildError([5, 41], [5, 45], buildMissingMessage('name')),
        ],
      },
    ],
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
      {
        code: `
          function Component(props) {
            return pug\`div(...anything)\`
          }
          Component.propTypes = { name: PropTypes.string }
        `,
        errors: [
          buildError([5, 41], [5, 57], buildUnusedMessage('name')),
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

  {
    name: 'Functional, Undefined props',
    invalid: [
      {
        code: `
          function Component(props) {
            return pug\`
              = props.test
            \`
          }
        `,
        errors: [
          buildError([4, 23], [4, 27], buildMissingMessage('test')),
        ],
      },
      {
        code: `
          function Component(props) {
            return pug\`
              = props [ 'test' ]
            \`
          }
        `,
        errors: [
          buildError([4, 25], [4, 31], buildMissingMessage('test')),
        ],
      },
      {
        code: `
          function Component(props) {
            return pug\`
              div(test=props.test)
            \`
          }
        `,
        errors: [
          buildError([4, 30], [4, 34], buildMissingMessage('test')),
        ],
      },
      {
        code: `
          function Component(props) {
            return pug\`
              div(...props.test)
            \`
          }
        `,
        errors: [
          buildError([4, 28], [4, 32], buildMissingMessage('test')),
        ],
      },
      {
        code: `
          function Component(props) {
            return pug\`
              div(props-test=props.test[props.key])
            \`
          }
        `,
        errors: [
          buildError([4, 36], [4, 40], buildMissingMessage('test')),
          buildError([4, 47], [4, 50], buildMissingMessage('key')),
        ],
      },
      {
        code: `
          const Component = (props) => {
            console.log(props.test)

            return pug\`
              = React.createElement(props.Component)
            \`
          }
        `,
        errors: [
          buildError([3, 31], [3, 35], buildMissingMessage('test')),
          buildError([6, 43], [6, 52], buildMissingMessage('Component')),
        ],
      },
    ],
  },

  {
    name: 'Nested variables',
    valid: [
      {
        code: `
          function Component(props) {
            return pug\`
              - props.map.a
            \`
          }
          Component.propTypes = {
            map: PropTypes.shape({
              a: PropTypes.bool,
            }),
          }
        `,
      },
      {
        code: `
          function Component(props) {
            return pug\`
              - props.map.b
              - props.map.c.a
            \`
          }
          Component.propTypes = {
            map: PropTypes.shape({
              a: PropTypes.bool,
              b: PropTypes.bool,
              c: PropTypes.shape({
                a: PropTypes.bool
              }),
            }),
          }
        `,
      },
      {
        code: `
          function Component(props) {
            props.list.length;
            props.list[1].test;
            return pug\`
              - props.listInPug.length
              - props.listInPug[1].test
            \`
          }
          Component.propTypes = {
            list: PropTypes.arrayOf(PropTypes.shape({
              test: PropTypes.bool,
            })),
            listInPug: PropTypes.arrayOf(PropTypes.shape({
              test: PropTypes.bool,
            }))
          }
        `,
      },
      {
        code: `
          function Component(props) {
            return pug\`
              each item in props.list
                div
                  div(key=item.id)
                    = item.test
                  div Hello

              = item.test
            \`
          }
          Component.propTypes = {
            list: PropTypes.arrayOf(PropTypes.shape({
              id: PropTypes.number,
              test: PropTypes.bool,
            })),
          }
        `,
      },
    ],
    invalid: [
      {
        code: `
          function Component(props) {
            return pug\`
              - props.map.b
              - props.all.any
            \`
          }
          Component.propTypes = {
            map: PropTypes.shape({
              a: PropTypes.bool,
            }),
            all: PropTypes.object,
          }
        `,
        errors: [
          buildError([4, 27], [4, 28], buildMissingMessage('map.b')),
          buildError([10, 18], [10, 32], buildUnusedMessage('map.a')),
        ],
      },
      {
        code: `
          function Component(props) {
            return pug\`
              - props.list.length
              - props.list[1].a
              - props.list[1].nope
              - props.list[1].b.c
              - props.list[1].b.nope
            \`
          }
          Component.propTypes = {
            list: PropTypes.arrayOf(PropTypes.shape({
              a: PropTypes.bool,
              b: PropTypes.shape({
                c: PropTypes.bool,
              }),
            })),
          }
        `,
        errors: [
          buildError([6, 31], [6, 35], buildMissingMessage('list[].nope')),
          buildError([8, 33], [8, 37], buildMissingMessage('list[].b.nope')),
        ],
      },
      {
        code: `
          const Component = (props) => {
            return pug\`
              = props.a.b
            \`
          }
          Component.propTypes = {
            a: PropTypes.shape({
              unused: PropTypes.bool,
            }),
          }
        `,
        errors: [
          buildError([4, 25], [4, 26], buildMissingMessage('a.b')),
          buildError([9, 23], [9, 37], buildUnusedMessage('a.unused')),
        ],
      },
      {
        only: true,
        code: `
          function Component(props) {
            const id = true

            return pug\`
              each item in props.list
                div
                  div(key=item.id)
                    = item.test
                  div Hello

              = item.test
            \`
          }
          Component.propTypes = {
            list: PropTypes.arrayOf(PropTypes.shape({})),
          }
        `,
        errors: [
          buildError([8, 32], [8, 34], buildMissingMessage('list[].id')),
          buildError([9, 28], [9, 32], buildMissingMessage('list[].test')),
        ],
      },
    ],
  },
]

ruleTester.run('rule "eslint"', rule, buildCases(cases))
