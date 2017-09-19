/**
 * @fileoverview Prevent React to be marked as unused
 * @author Eugene Zhlobo
 */
'use strict';

const { findVariablesInTemplate } = require('pug-uses-variables')

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

  create: function(context) {
    const sourceCode = context.getSourceCode()

    return {
      TaggedTemplateExpression: function(node) {
        const pragma = 'React'
        const { tag, quasi } = node

        if (tag && tag.name === 'pug') {
          const template = sourceCode.getText(quasi, -1, -1).trim()

          findVariablesInTemplate(template).forEach(context.markVariableAsUsed)
        }
      },
    }
  },
};
