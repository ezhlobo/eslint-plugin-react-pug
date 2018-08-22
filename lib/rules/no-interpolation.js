/**
 * @fileoverview Disallow JavaScript interpolation
 * @author Eugene Zhlobo
 */

const { isReactPugReference, buildLocation } = require('../util/eslint')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'Disallow JavaScript interpolation',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
  },

  create: function (context) {
    return {
      TaggedTemplateExpression: function (node) {
        if (isReactPugReference(node)) {
          if (node.quasi.expressions.length) {
            const lines = context.getSource().split('\n')

            node.quasi.expressions.forEach((expression) => {
              const line = lines.slice(expression.loc.start.line - 1)[0]

              const lineStartAt = line.search(/\S|$/)
              const lineEndAt = line.length + 1

              context.report({
                node,
                loc: buildLocation(
                  [expression.loc.start.line, lineStartAt],
                  [expression.loc.end.line, lineEndAt],
                ),
                message: 'Don\'t use JavaScript interpolation',
              })
            })
          }
        }
      },
    }
  },
}
