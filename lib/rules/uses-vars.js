/**
 * @fileoverview Prevent variables used in Pug to be marked as unused
 * @author Eugene Zhlobo
 */

const { findVariablesInTemplate } = require('pug-uses-variables')
const { isReactPugReference, getTemplate } = require('../utilities')

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

          findVariablesInTemplate(template).forEach(context.markVariableAsUsed)
        }
      },
    }
  },
}
