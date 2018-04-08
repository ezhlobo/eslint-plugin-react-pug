/**
 * @fileoverview Prevent variables used in Pug to be marked as unused
 * @author Eugene Zhlobo
 */

const { isReactPugReference, getTemplate, extractVariables } = require('../utilities')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'Prevent variables used in Pug to be marked as unused',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
  },

  create: function (context) {
    return {
      TaggedTemplateExpression: function (node) {
        if (isReactPugReference(node)) {
          const template = getTemplate(node)

          extractVariables(template)
            .forEach(variable => context.markVariableAsUsed(variable.value))
        }
      },
    }
  },
}
