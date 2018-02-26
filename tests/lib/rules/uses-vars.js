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

const { RuleTester } = eslint

const rule = require('../../../lib/rules/uses-vars')

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
  ],
  invalid: [
    {
      code: `
        /* eslint uses-vars: 1 */
        var text;

        pug\`div\`
      `,
      errors: [{ message: '\'text\' is defined but never used.' }],
    },
    {
      code: `
        /* eslint uses-vars: 1 */
        var Component, Child;

        pug\`Component\`
      `,
      errors: [{ message: '\'Child\' is defined but never used.' }],
    },
    {
      code: `
        /* eslint uses-vars: 1 */
        var Component;
        var Nested;

        pug\`Component.Nested Plain text\`
      `,
      errors: [{ message: '\'Nested\' is defined but never used.' }],
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
      errors: [{
        message: '\'HelloMessage\' is defined but never used.',
        line: 3,
      }],
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
      errors: [{
        message: '\'Hello\' is defined but never used.',
        line: 3,
      }],
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
      errors: [{
        message: '\'item\' is assigned a value but never used.',
        line: 3,
      }],
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
      errors: [{
        message: '\'variable\' is assigned a value but never used.',
        line: 3,
      }],
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
