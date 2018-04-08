/**
 * @fileoverview Disallow broken template
 * @author Eugene Zhlobo
 */

const { findVariablesInTemplate } = require('pug-uses-variables')
const { isReactPugReference, getTemplate, buildLocation } = require('../utilities')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'Disallow broken template',
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

          try {
            findVariablesInTemplate(template)
          } catch (error) {
            const line = (error.line + node.loc.start.line) - 1
            const source = error.src.split('\n')[error.line - 1]

            context.report({
              node,
              loc: buildLocation(
                [line, source.replace(/^([\s\t]+).*$/, '$1').length],
                [line, source.length],
              ),
              message: 'Pug can\'t parse this template',
            })
          }
        }
      },
    }
  },
}
