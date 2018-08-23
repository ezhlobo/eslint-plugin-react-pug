/**
 * @fileoverview Disallow JavaScript interpolation
 * @author Eugene Zhlobo
 */

const { isReactPugReference, buildLocation, docsUrl } = require('../util/eslint')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'Disallow JavaScript interpolation',
      category: 'Best Practices',
      recommended: true,
      url: docsUrl('no-interpolation'),
    },
    schema: [],
  },

  create: function (context) {
    const findLeftBound = (line, startAt) => line
      .slice(0, startAt)
      .replace(/^.*(\${\s*)$/, '$1')
      .length

    const findRightBound = (line, endAt) => line
      .slice(endAt)
      .replace(/^(\s*}).*$/, '$1')
      .length

    return {
      TaggedTemplateExpression: function (node) {
        if (isReactPugReference(node)) {
          if (node.quasi.expressions.length) {
            const lines = context.getSource().split('\n')

            node.quasi.expressions.forEach((expression) => {
              const line = lines.slice(expression.loc.start.line - 1)[0]

              const startAt = expression.loc.start.column
              const endAt = expression.loc.end.column

              context.report({
                node,
                loc: buildLocation(
                  [expression.loc.start.line, startAt - findLeftBound(line, startAt)],
                  [expression.loc.end.line, endAt + findRightBound(line, endAt)],
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
