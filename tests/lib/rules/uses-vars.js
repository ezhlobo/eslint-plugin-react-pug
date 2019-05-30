/**
 * @fileoverview Tests for uses-vars
 * @author Eugene Zhlobo
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const eslint = require('eslint')
const ruleNoUnusedVars = require('eslint/lib/rules/no-unused-vars')
const rulePreferConst = require('eslint/lib/rules/prefer-const')
const buildError = require('../../../lib/util/testBuildError')

const { RuleTester } = eslint

const rule = require('../../../lib/rules/uses-vars')

const parserOptions = {
  ecmaVersion: 8,
  sourceType: 'module',
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions })

const linter = ruleTester.linter || eslint.linter
linter.defineRule('uses-vars', rule)

ruleTester.run('rule "uses-vars" (no-unused-vars)', ruleNoUnusedVars, {
  valid: [
    {
      code: `
        /* eslint uses-vars: 1 */
        const text = ''

        pug\`div= text\`
      `,
    },
    {
      code: `
        /* eslint uses-vars: 1 */
        var Component, Child;

        pug\`Component(boolean): Child\`
      `,
    },
    {
      code: `
        /* eslint uses-vars: 1 */
        export default () => {
          const arg = ''
          const scopeFunction = () => () => {}

          return pug\`
            button(
              onClick=scopeFunction(arg)
            )
              | Scope Function
          \`
        }
      `,
    },
    {
      code: `
        /* eslint uses-vars: 1 */
        export const Field = props => pug\`
          Item(...props)
        \`
      `,
    },
    {
      code: `
        /* eslint uses-vars: 1 */
        export const Field = props => pug\`
          Item(...props.property)
        \`
      `,
    },
    {
      code: `
        /* eslint uses-vars: 1 */
        const string = 'string'
        const nested = 'nested'
        const array = [1, 2]
        const arrayNested = 'arrayNested'

        pug\`
          div
            \${string}

            \${pug\`div= nested\`}

            \${array.map(number => pug\`
              div(key=number)
                p= arrayNested
            \`)}
        \`
      `,
    },
    {
      code: `
        /* eslint uses-vars: 1 */
        const variable = 'variable'
        pug\`
          p.
            Big text with #{variable} interpolation
        \`
      `,
    },
    {
      code: `
        /* eslint uses-vars: 1 */
        pug\`
          if true
            = first
          else if true
            = second
          else
            = third
        \`
      `,
    },
    {
      code: `
        /* eslint uses-vars: 1 */
        pug\`
          div(data-test=\${false ? 'one' : 'two'})
        \`
      `,
    },
  ],
  invalid: [
    {
      code: `
        /* eslint uses-vars: 1 */
        var text;

        pug\`div\`
      `,
      errors: [
        buildError([3, 13], [3, 17], '\'text\' is defined but never used.'),
      ],
    },
    {
      code: `
        /* eslint uses-vars: 1 */
        var Component, Child;

        pug\`Component\`
      `,
      errors: [
        buildError([3, 24], [3, 29], '\'Child\' is defined but never used.'),
      ],
    },
    {
      code: `
        /* eslint uses-vars: 1 */
        var Component;
        var Nested;

        pug\`Component.Nested Plain text\`
      `,
      errors: [
        buildError([4, 13], [4, 19], '\'Nested\' is defined but never used.'),
      ],
    },
    {
      code: `
        /* eslint uses-vars: 1 */
        class HelloMessage {
          render() {
            var HelloMessage = pug\`div Text\`;
            return HelloMessage;
          }
        }
      `,
      errors: [
        buildError([3, 15], [3, 27], '\'HelloMessage\' is defined but never used.'),
      ],
    },
    {
      code: `
        /* eslint uses-vars: 1 */
        import {Hello} from 'Hello';
        function Greetings() {
          const Hello = require('Hello').default;
          return pug\`Hello\`;
        }
        Greetings();
      `,
      errors: [
        buildError([3, 17], [3, 22], '\'Hello\' is defined but never used.'),
      ],
    },
    {
      code: `
        /* eslint uses-vars: 1 */
        const item = true
        const variable = true
        pug\`
          each item, key in collection
            = item
            = key
            = variable
        \`
      `,
      errors: [
        buildError([3, 15], [3, 19], '\'item\' is assigned a value but never used.'),
      ],
    },
    {
      code: `
        /* eslint uses-vars: 1 */
        const variable = true
        const usedVariable = true
        pug\`
          div
            - const variable = true
            div
              = variable
              = usedVariable
        \`
      `,
      errors: [
        buildError([3, 15], [3, 23], '\'variable\' is assigned a value but never used.'),
      ],
    },
  ],
})

ruleTester.run('rule "uses-vars" (prefer-const)', rulePreferConst, {
  valid: [],
  invalid: [
    {
      code: `
        /* eslint uses-vars: 1 */
        let App = 'test';
        pug\`App\`;
      `,
      errors: [{ message: '\'App\' is never reassigned. Use \'const\' instead.' }],
    },
    {
      code: `
        /* eslint uses-vars: 1 */
        let filters = 'foo';

        pug\`div= filters\`;
      `,
      errors: [{ message: '\'filters\' is never reassigned. Use \'const\' instead.' }],
    },
  ],
})
