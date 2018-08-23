/**
 * @fileoverview Prevent React to be marked as unused
 * @author Eugene Zhlobo
 */

const { isReactPugReference, docsUrl } = require('../util/eslint')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'Prevent React to be marked as unused',
      category: 'Best Practices',
      recommended: true,
      url: docsUrl('uses-react'),
    },
    schema: [],
  },

  create: function (context) {
    return {
      TaggedTemplateExpression: function (node) {
        const pragma = 'React'

        if (isReactPugReference(node)) {
          context.markVariableAsUsed(pragma)
        }
      },
    }
  },
}
