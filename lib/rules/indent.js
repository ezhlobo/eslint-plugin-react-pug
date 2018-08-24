/**
 * @fileoverview Enforce consistent indentation
 * @author Eugene Zhlobo
 */

const { isReactPugReference, buildLocation, docsUrl } = require('../util/eslint')
const getTemplate = require('../util/getTemplate')
const getTokens = require('../util/getTokens')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const buildMessage = (expected, actual) => (
  `Expected indentation of ${expected} spaces but found ${actual}`
)

module.exports = {
  meta: {
    docs: {
      description: 'Enforce consistent indentation',
      category: 'Stylistic Issues',
      recommended: true,
      url: docsUrl('indent'),
    },
    schema: [],
  },

  create: function (context) {
    const STEP = 2

    return {
      TaggedTemplateExpression: function (node) {
        if (isReactPugReference(node)) {
          if (node.loc.end.line === node.loc.start.line) {
            return false
          }

          const wrongIndent = []

          const template = getTemplate(node)
          const tokens = getTokens(template)

          const minimalIndent = node.loc.start.column

          let currentIndent = 0
          tokens.forEach((token, index) => {
            if (token.type === 'indent' || index === 0) {
              currentIndent += 1

              const actual = token.loc.end.column - 1
              const expected = minimalIndent + currentIndent * STEP

              if (actual !== expected) {
                wrongIndent.push({
                  line: token.loc.start.line,
                  actual,
                  expected,
                })
              }
            } else if (token.type === 'outdent') {
              currentIndent -= 1
            }
          })

          wrongIndent.forEach((item) => {
            context.report({
              node,
              loc: buildLocation(
                [item.line + node.loc.start.line - 1, 0],
                [item.line + node.loc.start.line - 1, item.actual],
              ),
              message: buildMessage(item.expected, item.actual),
            })
          })
        }

        return false
      },
    }
  },
}
