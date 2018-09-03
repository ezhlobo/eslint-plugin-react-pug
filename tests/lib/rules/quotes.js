/**
 * @fileoverview Tests for quotes
 * @author Eugene Zhlobo
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const eslint = require('eslint')
const buildError = require('../../../lib/util/testBuildError')

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
    {
      code: `
        pug\`
          each item in Array(10).fill('one')
            p Hello
        \`
      `,
    },
    {
      code: `
        pug\`
          div(class=['one', 'two', test['three']].join(' '))
        \`
      `,
    },
  ],
  invalid: [
    {
      code: `
        pug\`div(attr= ' hello '  second=  ' hello ' )\`
      `,
      errors: [
        buildError([2, 24], [2, 33], MESSAGE_PLAIN),
        buildError([2, 44], [2, 53], MESSAGE_PLAIN),
      ],
    },
    {
      code: `
        pug\`div(attr= 1 + 'hello' + 1 )\`
      `,
      errors: [
        buildError([2, 28], [2, 35], MESSAGE_PLAIN),
      ],
    },
    {
      code: `
        pug\`
          div(attr= ' hello ' )
        \`
      `,
      errors: [
        buildError([3, 21], [3, 30], MESSAGE_PLAIN),
      ],
    },
    {
      code: `
        function Example() {
          return pug\`div( attr= test ?  'one'  :  'two' || 'three' )\`
        }
      `,
      errors: [
        buildError([3, 42], [3, 47], MESSAGE_PLAIN),
        buildError([3, 52], [3, 57], MESSAGE_PLAIN),
        buildError([3, 61], [3, 68], MESSAGE_PLAIN),
      ],
    },
    {
      code: `
        pug\`
          div(attr= test ? 'one' :  'two')
        \`
      `,
      errors: [
        buildError([3, 28], [3, 33], MESSAGE_PLAIN),
        buildError([3, 37], [3, 42], MESSAGE_PLAIN),
      ],
    },
    {
      code: `
        pug\`div(attr={ test:  "one" })\`
      `,
      errors: [
        buildError([2, 32], [2, 37], MESSAGE_CODE),
      ],
    },
    {
      code: `
        pug\`div(attr=[ "one" ])\`
      `,
      errors: [
        buildError([2, 25], [2, 30], MESSAGE_CODE),
      ],
    },
    {
      code: `
        pug\`
          div= "one"
          div #{"one"}
        \`
      `,
      errors: [
        buildError([3, 16], [3, 21], MESSAGE_CODE),
        buildError([4, 17], [4, 22], MESSAGE_CODE),
      ],
    },
    {
      code: `
        pug\`
          each item, index in [ "one", "two" ]
            p '#{item}'
            p "#{item}"
        \`
      `,
      errors: [
        buildError([3, 33], [3, 38], MESSAGE_CODE),
        buildError([3, 40], [3, 45], MESSAGE_CODE),
      ],
    },
    {
      code: `
        pug\`
          each item in Array(10).fill("one")
            p Hello
        \`
      `,
      errors: [
        buildError([3, 39], [3, 44], MESSAGE_CODE),
      ],
    },
    {
      code: `
        pug\`
          div(class=["one", "two", test["three"]].join(" "))
        \`
      `,
      errors: [
        buildError([3, 22], [3, 27], MESSAGE_CODE),
        buildError([3, 29], [3, 34], MESSAGE_CODE),
        buildError([3, 41], [3, 48], MESSAGE_CODE),
        buildError([3, 56], [3, 59], MESSAGE_CODE),
      ],
    },
  ],
})
