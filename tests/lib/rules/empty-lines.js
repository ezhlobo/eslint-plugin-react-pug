/**
 * @fileoverview Tests for empty-lines
 * @author Eugene Zhlobo
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const eslint = require('eslint')
const buildError = require('../../../lib/util/testBuildError')

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
  no_lines_indent: 'Expected no empty lines for nested items',
  need_empty_siblings: 'Need empty line for more than two siblings',
  need_empty_outdent: 'Need empty line when you are off from the scope',
}

ruleTester.run('rule "empty-lines"', rule, {
  valid: [
    { code: 'pug`div text`' },
    { code: 'pug` div text `' },
    {
      code: `
        pug\`
          div text
        \`
      `,
    },
    {
      code: `
        pug\`
          div text
          div text
        \`
      `,
    },
    {
      code: `
        pug\`
          div text

          div text
        \`
      `,
    },
    {
      code: `
        pug\`
          div text

          div text

          div text
        \`
      `,
    },
    {
      code: `
        pug\`
          div
            div text

          div text
          div text
        \`
      `,
    },
    {
      code: `
        pug\`
          div
            div text

          div text

          div text

          div text
        \`
      `,
    },
    {
      code: `
        pug\`
          div
            div
              div text

            div text

          div text
        \`
      `,
    },
    {
      code: `
        pug\`
          div before
          | one
          | two
          | tree
          | four
          div after
        \`
      `,
    },
    {
      code: `
        pug\`
          div.
            Hello
            Second
            Third
            Fourth
        \`
      `,
    },
    {
      code: `
        pug\`
          div
            div text
        \`
      `,
    },
    {
      code: `
        pug\`
          div.
            Text

          div Text
        \`
      `,
    },
    {
      code: `
        pug\`
          div
            div.
              Text inside

            div.
              Text inside

            div.
              Text inside
        \`
      `,
    },
    {
      code: `
        pug\`
          div
            div Text inside

            div.
              Text inside
              One
              Two
              Three

            div.
              Text inside

            div.
              Text inside
        \`
      `,
    },
    {
      code: `
        const result = pug\`Component(
          attr="first"
        )\`
      `,
    },
    {
      code: `
        pug\`
          div
            // div One
            // div Two
            // div Three
        \`
      `,
    },
    {
      code: `
        pug\`
          div
            // div One

            // div Two
            // div Three
        \`
      `,
    },
    {
      code: `
        pug\`
          div
            // div One

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
      errors: [
        buildError([2, 12], [2, 16], MESSAGE.newline_start),
      ],
    },
    {
      code: `
        pug\`   div
        \`
      `,
      errors: [
        buildError([2, 12], [2, 19], MESSAGE.newline_start),
      ],
    },
    {
      code: `
        pug\`
          div\`
      `,
      errors: [
        buildError([3, 11], [3, 15], MESSAGE.newline_end),
      ],
    },
    {
      code: `
        pug\`
          div  \`
      `,
      errors: [
        buildError([3, 11], [3, 17], MESSAGE.newline_end),
      ],
    },
    {
      code: `
        pug\`

          div text
        \`
      `,
      errors: [
        buildError([2, 1], [3, 1], MESSAGE.single_empty_lines),
      ],
    },
    {
      code: `
        pug\`
          div text

        \`
      `,
      errors: [
        buildError([4, 1], [5, 1], MESSAGE.single_empty_lines),
      ],
    },
    {
      code: `
        pug\`

          div text

        \`
      `,
      errors: [
        buildError([2, 1], [3, 1], MESSAGE.single_empty_lines),
        buildError([5, 1], [6, 1], MESSAGE.single_empty_lines),
      ],
    },
    {
      code: `
        pug\`
          div text



          div text
        \`
      `,
      errors: [
        buildError([4, 1], [5, 1], MESSAGE.single_empty_lines),
        buildError([5, 1], [6, 1], MESSAGE.single_empty_lines),
      ],
    },
    {
      code: `
        pug\`
          div
            div text


          div text
        \`
      `,
      errors: [
        buildError([5, 1], [6, 1], MESSAGE.single_empty_lines),
      ],
    },
    {
      code: `
        pug\`
          div one
          div two
          div three
        \`
      `,
      errors: [
        buildError([4, 1], [4, 11], MESSAGE.need_empty_siblings),
        buildError([5, 1], [5, 11], MESSAGE.need_empty_siblings),
      ],
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
      errors: [
        buildError([4, 1], [4, 11], MESSAGE.need_empty_siblings),
        buildError([5, 1], [5, 11], MESSAGE.need_empty_siblings),
        buildError([6, 1], [6, 11], MESSAGE.need_empty_siblings),
      ],
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
              div text

            div text
            div text
        \`
      `,
      errors: [
        buildError([5, 1], [5, 13], MESSAGE.need_empty_siblings),
        buildError([6, 1], [6, 13], MESSAGE.need_empty_siblings),
      ],
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
      errors: [
        buildError([7, 1], [7, 11], MESSAGE.need_empty_siblings),
        buildError([8, 1], [8, 11], MESSAGE.need_empty_siblings),
      ],
    },
    {
      code: `
        pug\`
          div one
          div two
          div
            div four
        \`
      `,
      errors: [
        buildError([4, 1], [4, 11], MESSAGE.need_empty_siblings),
        buildError([5, 1], [5, 11], MESSAGE.need_empty_siblings),
      ],
    },
    {
      code: `
        pug\`
          div one

          div two
          div three
        \`
      `,
      errors: [
        buildError([6, 1], [6, 11], MESSAGE.need_empty_siblings),
      ],
    },
    {
      code: `
        pug\`
          div one
          div two

          div three
        \`
      `,
      errors: [
        buildError([4, 1], [4, 11], MESSAGE.need_empty_siblings),
      ],
    },
    {
      code: `
        pug\`
          div
            div text
          div text
        \`
      `,
      errors: [
        buildError([5, 1], [5, 11], MESSAGE.need_empty_outdent),
      ],
    },
    {
      code: `
        pug\`
          div
            div
              div text
            div text
          div text
        \`
      `,
      errors: [
        buildError([6, 1], [6, 13], MESSAGE.need_empty_outdent),
        buildError([7, 1], [7, 11], MESSAGE.need_empty_outdent),
      ],
    },
    {
      code: `
        pug\`
          div one
          | text
          div two
          div three
          div four
        \`
      `,
      errors: [
        buildError([6, 1], [6, 11], MESSAGE.need_empty_siblings),
        buildError([7, 1], [7, 11], MESSAGE.need_empty_siblings),
      ],
    },
    {
      code: `
        pug\`
          div
            | text
            | text
            | text
            | text
          div text
        \`
      `,
      errors: [
        buildError([8, 1], [8, 11], MESSAGE.need_empty_outdent),
      ],
    },
    {
      code: `
        pug\`
          div

            div text
        \`
      `,
      errors: [
        buildError([3, 14], [5, 13], MESSAGE.no_lines_indent),
      ],
    },
    {
      code: `
        pug\`
          div
            div

            div

              div text
        \`
      `,
      errors: [
        buildError([6, 16], [8, 15], MESSAGE.no_lines_indent),
      ],
    },
    {
      code: `
        pug\`
          div.
            Text
          div Text
        \`
      `,
      errors: [
        buildError([5, 1], [5, 11], MESSAGE.need_empty_outdent),
      ],
    },
    {
      code: `
        pug\`
          div
            // div Text


            // div Text
        \`
      `,
      errors: [
        buildError([5, 1], [6, 1], MESSAGE.single_empty_lines),
      ],
    },
    {
      code: `
        pug\`
          div

            // div One
        \`
      `,
      errors: [
        buildError([3, 14], [5, 13], MESSAGE.no_lines_indent),
      ],
    },
    {
      code: `
        pug\`
          div
            // div One
          div
        \`
      `,
      errors: [
        buildError([5, 1], [5, 11], MESSAGE.need_empty_outdent),
      ],
    },
  ],
})
