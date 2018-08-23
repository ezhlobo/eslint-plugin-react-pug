/**
 * @fileoverview Prevent variables used in Pug to be marked as unused
 * @author Eugene Zhlobo
 */

const { isReactPugReference, docsUrl } = require('../util/eslint')
const getTemplate = require('../util/getTemplate')
const getVariables = require('../util/getVariables')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'Prevent variables used in Pug to be marked as unused',
      category: 'Best Practices',
      recommended: true,
      url: docsUrl('uses-vars'),
    },
    schema: [],
  },

  create: function (context) {
    return {
      TaggedTemplateExpression: function (node) {
        if (isReactPugReference(node)) {
          const template = getTemplate(node)

          getVariables(template)
            .forEach(variable => context.markVariableAsUsed(variable.value))
        }
      },
    }
  },
}
