/**
 * @fileoverview Disallow broken template
 * @author Eugene Zhlobo
 */

const lexer = require('pug-lexer')

const { isReactPugReference, buildLocation, docsUrl } = require('../util/eslint')
const getTemplate = require('../util/getTemplate')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'Disallow broken template',
      category: 'Possible Errors',
      recommended: true,
      url: docsUrl('no-broken-template'),
    },
    schema: [],
  },

  create: function (context) {
    return {
      TaggedTemplateExpression: function (node) {
        if (isReactPugReference(node)) {
          const template = getTemplate(node)
          try {
            lexer(template)
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
