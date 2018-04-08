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
    function getDefinedVariables() {
      let scope = context.getScope()
      let scopeVariables = scope.variables

      while (scope.type !== 'global') {
        scope = scope.upper
        scopeVariables = scope.variables.concat(scopeVariables)
      }

      return scopeVariables.map(variable => variable.name)
    }

    return {
      TaggedTemplateExpression: function (node) {
        if (isReactPugReference(node)) {
          const template = getTemplate(node)

          const usedVariables = findVariablesInTemplate(template)
          const definedVariables = getDefinedVariables()

          const isVariableDefined = variable => !definedVariables.includes(variable.value)

          const notDefinedVariables = usedVariables.filter(isVariableDefined)

          notDefinedVariables.forEach((variable) => {
            context.report({
              node,
              loc: variable.loc,
              message: `'${variable.value}' is not defined.`,
            })
          })
        }
      },
    }
  },
}
