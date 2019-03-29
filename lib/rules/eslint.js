/**
 * @fileoverview Lint JavaScript code inside Pug
 * @author Eugene Zhlobo
 */

// eslint-disable-next-line import/no-extraneous-dependencies
const { Linter } = require('eslint')

const { isReactPugReference, buildLocation, docsUrl } = require('../util/eslint')
const getTemplate = require('../util/getTemplate')
const getTokens = require('../util/getTokens')
const normalizeValueForBabel = require('../util/normalizeValueForBabel')

const linter = new Linter()

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'Lint JavaScript code inside Pug',
      category: 'Stylistic Issues',
      recommended: false,
      url: docsUrl('eslint'),
    },
    schema: [
      {
        type: 'object',
      },
    ],
  },

  create: function (context) {
    const lint = source => linter.verify(source, {
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        ecmaFeatures: {
          generators: false,
          objectLiteralDuplicateProperties: false,
        },
      },
      rules: {
        ...context.options[0],

        // Controlled via other rules:
        quotes: 'off',
        'no-undef': 'off',

        // To bypass literals and one-line source
        'eol-last': 'off',
        'no-unused-expressions': 'off',

        // Unsupported features by pug
        'prefer-template': 'off',
        'prefer-destructuring': 'off',
      },
    })

    const getStringToLint = (token) => {
      switch (token.type) {
        case 'each':
          return token.code

        case 'attribute':
        case 'if':
        case 'else-if':
        case 'code':
        case 'interpolated-code':
          return token.val

        default:
          return null
      }
    }

    return {
      TaggedTemplateExpression: function (node) {
        if (isReactPugReference(node)) {
          const template = getTemplate(node)
          const tokens = getTokens(template)
          const lines = template.split('\n')

          tokens.forEach((token) => {
            const rawSource = getStringToLint(token)

            if (rawSource) {
              const isMultiline = token.loc.start.line !== token.loc.end.line
              const extraIndent = isMultiline
                ? token.loc.start.column - 1
                : 0

              const source = normalizeValueForBabel(rawSource, extraIndent)

              const reports = lint(source)

              if (reports.length) {
                reports.forEach((report) => {
                  const reportLine = token.loc.start.line - 1 + report.line - 1
                  const reportSource = source.split('\n')[report.line - 1]
                  const sourceStartColumn = lines[reportLine].indexOf(reportSource) - 1
                  const sourceStartLine = node.loc.start.line + token.loc.start.line - 2

                  const startLine = sourceStartLine + report.line
                  const endLine = sourceStartLine + (report.endLine || report.line)

                  const loc = report.endColumn
                    ? buildLocation(
                      [startLine, sourceStartColumn + report.column],
                      [endLine, sourceStartColumn + report.endColumn],
                    )
                    : buildLocation(
                      [startLine, sourceStartColumn + 1],
                      [endLine, sourceStartColumn + reportSource.length + 1],
                    )

                  context.report({
                    node,
                    loc,
                    message: report.message,
                  })
                })
              }
            }
          })
        }
      },
    }
  },
}
