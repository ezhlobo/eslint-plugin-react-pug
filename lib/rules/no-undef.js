/**
 * @fileoverview Disallow undeclared variables in Pug
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
      description: 'Disallow undeclared variables in Pug',
      category: 'Possible Errors',
      recommended: true,
    },
    schema: [],
  },

  create: function (context) {
    return {
      TaggedTemplateExpression: function (node) {
        if (isReactPugReference(node)) {
          const template = getTemplate(node)
          const usedVariables = findVariablesInTemplate(template)

          let scope = context.getScope()
          let scopeVariables = scope.variables

          while (scope.type !== 'global') {
            scope = scope.upper
            scopeVariables = scope.variables.concat(scopeVariables)
          }

          scopeVariables = scopeVariables.map(variable => variable.name)

          const notDefinedVariables = []

          usedVariables.forEach((variable) => {
            if (scopeVariables.indexOf(variable) === -1) {
              notDefinedVariables.push(variable)
            }
          })

          notDefinedVariables.forEach((variable) => {
            context.report({
              node,
              message: `'${variable}' is not defined.`,
            })
          })
        }
      },
    }
  },
}
