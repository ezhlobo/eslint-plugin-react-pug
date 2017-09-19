/**
 * @fileoverview Prevent variables used in JSX to be marked as unused
 * @author Eugene Zhlobo
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const eslint = require('eslint')
const ruleNoUnusedVars = require('eslint/lib/rules/no-unused-vars')
const rulePreferConst = require('eslint/lib/rules/prefer-const')
const RuleTester = eslint.RuleTester

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

        pug\`Component: Child\`
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
      errors: [{ message: '\'text\' is defined but never used.' }]
    },
    {
      code: `
        /* eslint uses-vars: 1 */
        var Component, Child;

        pug\`Component\`
      `,
      errors: [{ message: '\'Child\' is defined but never used.' }]
    },
    {
      code: `
        /* eslint uses-vars: 1 */
        var Component;
        var Nested;

        pug\`Component.Nested Plain text\`
      `,
      errors: [{ message: '\'Nested\' is defined but never used.' }]
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
});
