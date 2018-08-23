/**
 * @fileoverview Tests for quotes
 * @author Eugene Zhlobo
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const eslint = require('eslint')

const { RuleTester } = eslint

const rule = require('../../../lib/rules/quotes')

const parserOptions = {
  ecmaVersion: 8,
  sourceType: 'module',
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions })

const MESSAGE_PLAIN = 'Strings must use double quotes'
const MESSAGE_CODE = 'Code must use single quotes'

ruleTester.run('rule "quotes"', rule, {
  valid: [
    { code: 'pug`div(attr="hello")`' },
    { code: 'pug`div(attr=test ? "one": "two")`' },
    { code: 'pug`div(attr={ test: \'one\' })`' },
    { code: 'pug`div(attr=[ \'one\' ])`' },
    { code: 'pug`div(attr)`' },
    { code: 'pug`div(attr=true)`' },
    { code: 'pug`div(attr=false)`' },
    { code: 'pug`div(...props)`' },
    { code: 'pug`div= \'test\'`' },
    {
      code: `
        pug\`
          each item, index in [ 'one', 'two', 3, 'four' ]
            p= item
        \`
      `,
    },
    {
      code: `
        pug\`
          div 'Hello'
          div "Hello"
          div
            | 'Hello'
            | "Hello"
        \`
      `,
    },
  ],
  invalid: [
    {
      code: `
        pug\`div(attr= ' hello '  second=  ' hello ' )\`
      `,
      errors: [{
        message: MESSAGE_PLAIN,
        line: 2,
        column: 24,
        endLine: 2,
        endColumn: 33,
      }, {
        message: MESSAGE_PLAIN,
        line: 2,
        column: 44,
        endLine: 2,
        endColumn: 53,
      }],
    },
    {
      code: `
        pug\`div(attr= 1 + 'hello' + 1 )\`
      `,
      errors: [{
        message: MESSAGE_PLAIN,
        line: 2,
        column: 28,
        endLine: 2,
        endColumn: 35,
      }],
    },
    {
      code: `
        pug\`
          div(attr= ' hello ' )
        \`
      `,
      errors: [{
        message: MESSAGE_PLAIN,
        line: 3,
        column: 21,
        endLine: 3,
        endColumn: 30,
      }],
    },
    {
      code: `
        function Example() {
          return pug\`div( attr= test ?  'one'  :  'two' || 'three' )\`
        }
      `,
      errors: [{
        message: MESSAGE_PLAIN,
        line: 3,
        column: 42,
        endLine: 3,
        endColumn: 47,
      }, {
        message: MESSAGE_PLAIN,
        line: 3,
        column: 52,
        endLine: 3,
        endColumn: 57,
      }, {
        message: MESSAGE_PLAIN,
        line: 3,
        column: 61,
        endLine: 3,
        endColumn: 68,
      }],
    },
    {
      code: `
        pug\`
          div(attr= test ? 'one' :  'two')
        \`
      `,
      errors: [{
        message: MESSAGE_PLAIN,
        line: 3,
        column: 28,
        endLine: 3,
        endColumn: 33,
      }, {
        message: MESSAGE_PLAIN,
        line: 3,
        column: 37,
        endLine: 3,
        endColumn: 42,
      }],
    },
    {
      code: `
        pug\`div(attr={ test:  "one" })\`
      `,
      errors: [{
        message: MESSAGE_CODE,
        line: 2,
        column: 32,
        endLine: 2,
        endColumn: 37,
      }],
    },
    {
      code: `
        pug\`div(attr=[ "one" ])\`
      `,
      errors: [{
        message: MESSAGE_CODE,
        line: 2,
        column: 25,
        endLine: 2,
        endColumn: 30,
      }],
    },
    {
      code: `
        pug\`
          div= "one"
          div #{"one"}
        \`
      `,
      errors: [{
        message: MESSAGE_CODE,
        line: 3,
        column: 16,
        endLine: 3,
        endColumn: 21,
      }, {
        message: MESSAGE_CODE,
        line: 4,
        column: 17,
        endLine: 4,
        endColumn: 22,
      }],
    },
    {
      code: `
        pug\`
          each item, index in [ "one", "two" ]
            p '#{item}'
            p "#{item}"
        \`
      `,
      errors: [{
        message: MESSAGE_CODE,
        line: 3,
        column: 33,
        endLine: 3,
        endColumn: 38,
      }, {
        message: MESSAGE_CODE,
        line: 3,
        column: 40,
        endLine: 3,
        endColumn: 45,
      }],
    },
  ],
})
