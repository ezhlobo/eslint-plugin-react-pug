/**
 * @fileoverview Tests for empty-lines
 * @author Eugene Zhlobo
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const eslint = require('eslint')

const { RuleTester } = eslint

const rule = require('../../../lib/rules/empty-lines')

const parserOptions = {
  sourceType: 'module',
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions })

const MESSAGE = {
  newline_start: 'Expected new line in the beginning',
  newline_end: 'Expected new line in the end',
  single_empty_lines: 'Use 1 empty line',
  need_empty_siblings: 'Need empty line for more than two siblings',
  need_empty_outdent: 'Need empty line when you are off from the scope',
}

ruleTester.run('rule "empty-lines"', rule, {
  valid: [
    { code: 'pug`div`' },
    { code: 'pug` div `' },
    {
      code: `
        pug\`
          div
        \`
      `,
    },
    {
      code: `
        pug\`
          div
          div
        \`
      `,
    },
    {
      code: `
        pug\`
          div

          div
        \`
      `,
    },
    {
      code: `
        pug\`
          div

          div

          div
        \`
      `,
    },
    {
      code: `
        pug\`
          div
            div

          div
          div
        \`
      `,
    },
    {
      code: `
        pug\`
          div
            div

          div

          div

          div
        \`
      `,
    },
    {
      code: `
        pug\`
          div
            div
              div

            div

          div
        \`
      `,
    },
  ],
  invalid: [
    {
      code: `
        pug\`div
        \`
      `,
      errors: [{
        message: MESSAGE.newline_start,
        line: 2,
        column: 12,
        endLine: 2,
        endColumn: 16,
      }],
    },
    {
      code: `
        pug\`   div
        \`
      `,
      errors: [{
        message: MESSAGE.newline_start,
        line: 2,
        column: 12,
        endLine: 2,
        endColumn: 19,
      }],
    },
    {
      code: `
        pug\`
          div\`
      `,
      errors: [{
        message: MESSAGE.newline_end,
        line: 3,
        column: 11,
        endLine: 3,
        endColumn: 15,
      }],
    },
    {
      code: `
        pug\`
          div  \`
      `,
      errors: [{
        message: MESSAGE.newline_end,
        line: 3,
        column: 11,
        endLine: 3,
        endColumn: 17,
      }],
    },
    {
      code: `
        pug\`

          div
        \`
      `,
      errors: [{
        message: MESSAGE.single_empty_lines,
        line: 2,
        column: 1,
        endLine: 3,
        endColumn: 1,
      }],
    },
    {
      code: `
        pug\`
          div

        \`
      `,
      errors: [{
        message: MESSAGE.single_empty_lines,
        line: 4,
        column: 1,
        endLine: 5,
        endColumn: 1,
      }],
    },
    {
      code: `
        pug\`

          div

        \`
      `,
      errors: [{
        message: MESSAGE.single_empty_lines,
        line: 2,
        column: 1,
        endLine: 3,
        endColumn: 1,
      }, {
        message: MESSAGE.single_empty_lines,
        line: 5,
        column: 1,
        endLine: 6,
        endColumn: 1,
      }],
    },
    {
      code: `
        pug\`
          div



          div
        \`
      `,
      errors: [{
        message: MESSAGE.single_empty_lines,
        line: 4,
        column: 1,
        endLine: 5,
        endColumn: 1,
      }, {
        message: MESSAGE.single_empty_lines,
        line: 5,
        column: 1,
        endLine: 6,
        endColumn: 1,
      }],
    },
    {
      code: `
        pug\`
          div
            div


          div
        \`
      `,
      errors: [{
        message: MESSAGE.single_empty_lines,
        line: 5,
        column: 1,
        endLine: 6,
        endColumn: 1,
      }],
    },
    {
      code: `
        pug\`
          div one
          div two
          div three
        \`
      `,
      errors: [{
        line: 4,
        column: 1,
        endLine: 4,
        endColumn: 11,
        message: MESSAGE.need_empty_siblings,
      }, {
        line: 5,
        column: 1,
        endLine: 5,
        endColumn: 11,
        message: MESSAGE.need_empty_siblings,
      }],
    },
    {
      code: `
        pug\`
          div one
          div two
          div three
          div four
        \`
      `,
      errors: [{
        line: 4,
        column: 1,
        endLine: 4,
        endColumn: 11,
        message: MESSAGE.need_empty_siblings,
      }, {
        line: 5,
        column: 1,
        endLine: 5,
        endColumn: 11,
        message: MESSAGE.need_empty_siblings,
      }, {
        line: 6,
        column: 1,
        endLine: 6,
        endColumn: 11,
        message: MESSAGE.need_empty_siblings,
      }],
    },
    {
      code: `
        pug\`
          div
            div one
            div two
            div three

          div
            div
              div

            div
            div
        \`
      `,
      errors: [{
        line: 5,
        column: 1,
        endLine: 5,
        endColumn: 13,
        message: MESSAGE.need_empty_siblings,
      }, {
        line: 6,
        column: 1,
        endLine: 6,
        endColumn: 13,
        message: MESSAGE.need_empty_siblings,
      }],
    },
    {
      code: `
        pug\`
          div
            div

          div one
          div two
          div three
        \`
      `,
      errors: [{
        line: 7,
        column: 1,
        endLine: 7,
        endColumn: 11,
        message: MESSAGE.need_empty_siblings,
      }, {
        line: 8,
        column: 1,
        endLine: 8,
        endColumn: 11,
        message: MESSAGE.need_empty_siblings,
      }],
    },
    {
      code: `
        pug\`
          div one
          div two
          div
            div
        \`
      `,
      errors: [{
        line: 4,
        column: 1,
        endLine: 4,
        endColumn: 11,
        message: MESSAGE.need_empty_siblings,
      }, {
        line: 5,
        column: 1,
        endLine: 5,
        endColumn: 11,
        message: MESSAGE.need_empty_siblings,
      }],
    },
    {
      code: `
        pug\`
          div one

          div two
          div three
        \`
      `,
      errors: [{
        line: 6,
        column: 1,
        endLine: 6,
        endColumn: 11,
        message: MESSAGE.need_empty_siblings,
      }],
    },
    {
      code: `
        pug\`
          div one
          div two

          div three
        \`
      `,
      errors: [{
        line: 4,
        column: 1,
        endLine: 4,
        endColumn: 11,
        message: MESSAGE.need_empty_siblings,
      }],
    },
    {
      code: `
        pug\`
          div
            div
          div
        \`
      `,
      errors: [{
        line: 5,
        column: 1,
        endLine: 5,
        endColumn: 11,
        message: MESSAGE.need_empty_outdent,
      }],
    },
    {
      code: `
        pug\`
          div
            div
              div
            div
          div
        \`
      `,
      errors: [{
        line: 6,
        column: 1,
        endLine: 6,
        endColumn: 13,
        message: MESSAGE.need_empty_outdent,
      }, {
        line: 7,
        column: 1,
        endLine: 7,
        endColumn: 11,
        message: MESSAGE.need_empty_outdent,
      }],
    },
  ],
})
