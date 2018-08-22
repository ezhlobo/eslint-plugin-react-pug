/**
 * @fileoverview Disallow undeclared variables in Pug
 * @author Eugene Zhlobo
 */

const { isReactPugReference, buildLocation } = require('../util/eslint')
const getTemplate = require('../util/getTemplate')
const getVariables = require('../util/getVariables')

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

          const usedVariables = getVariables(template)
          const definedVariables = getDefinedVariables()

          const isVariableDefined = variable => !definedVariables.includes(variable.value)

          const notDefinedVariables = usedVariables.filter(isVariableDefined)

          notDefinedVariables.forEach((variable) => {
            const delta = variable.loc.start.line === 1
              // When template starts plus backtick
              ? node.quasi.quasis[0].loc.start.column
              : -1

            const columnStart = variable.loc.start.column + delta
            const columnEnd = variable.loc.end.column + delta

            context.report({
              node,
              loc: buildLocation(
                [(node.loc.start.line + variable.loc.start.line) - 1, columnStart + 1],
                [(node.loc.start.line + variable.loc.end.line) - 1, columnEnd + 1],
              ),
              message: `'${variable.value}' is not defined.`,
            })
          })
        }
      },
    }
  },
}
