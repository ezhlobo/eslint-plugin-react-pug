/**
 * @fileoverview Prevent React to be marked as unused
 * @author Eugene Zhlobo
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'Prevent React to be marked as unused',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
  },

  create: function (context) {
    return {
      TaggedTemplateExpression: function (node) {
        const pragma = 'React'
        const { tag } = node

        if (tag && tag.name === 'pug') {
          context.markVariableAsUsed(pragma)
        }
      },
    }
  },
}
