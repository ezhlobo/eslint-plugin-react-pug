/**
 * @fileoverview
 * @author Eugene Zhlobo
 */

const Linter = require('pug-lint')

const { isReactPugReference, buildLocation, docsUrl } = require('../util/eslint')
const getTemplate = require('../util/getTemplate')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: '',
      category: '',
      recommended: true,
      url: docsUrl('pug-lint'),
    },
    schema: [
      {
        type: 'object',
      },
    ],
  },

  create: function (context) {
    return {
      TaggedTemplateExpression: function (node) {
        if (isReactPugReference(node)) {
          const template = getTemplate(node)

          const linter = new Linter()

          linter.configure(context.options[0])

          const result = linter.checkString(template, 'testfile')

          if (result.length) {
            result.forEach((error) => {
              const delta = error.line === 1
                // When template starts plus backtick
                ? node.quasi.quasis[0].loc.start.column + 1
                : -1

              const columnStart = error.column + delta
              const columnEnd = error.column + delta

              context.report({
                node,
                loc: buildLocation(
                  [(node.loc.start.line + error.line) - 1, columnStart],
                  [(node.loc.start.line + error.line) - 1, columnEnd],
                ),
                message: error.msg,
              })
            })
          }
        }
      },
    }
  },
}
