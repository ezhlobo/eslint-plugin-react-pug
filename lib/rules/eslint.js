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
                  const sourceColumnStart = lines[reportLine].indexOf(reportSource) - 1

                  const startLine = report.line
                  const endLine = report.endLine || startLine
                  const startColumn = report.column
                  const endColumn = report.endColumn || startColumn
                  context.report({
                    node,
                    loc: buildLocation(
                      [token.loc.start.line + startLine, sourceColumnStart + startColumn],
                      [token.loc.start.line + endLine, sourceColumnStart + endColumn],
                    ),
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
