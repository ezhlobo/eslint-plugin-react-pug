/**
 * @fileoverview
 * @author Eugene Zhlobo
 */

const Linter = require('pug-lint')
const common = require('common-prefix')

const { isReactPugReference, buildLocation, docsUrl } = require('../util/eslint')
const getTemplate = require('../util/getTemplate')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const buildMessage = actual => (
  `Invalid indentation, found "${actual}" spaces`
)

module.exports = {
  meta: {
    docs: {
      description: '',
      category: '',
      recommended: true,
      url: docsUrl('pug-lint'),
    },
    schema: [
      {
        type: 'object',
      },
    ],
  },

  create: function (context) {
    return {
      TaggedTemplateExpression: function (node) {
        if (isReactPugReference(node)) {
          const template = getTemplate(node)

          const linter = new Linter()

          linter.configure(context.options[0])

          const firstTokenInLine = context
            .getSourceCode()
            .getTokensBefore(node, {
              filter: token => token.loc.end.line === node.loc.start.line,
            })[0]

          const minimalIndent = firstTokenInLine
            ? firstTokenInLine.loc.start.column
            : node.loc.start.column

          const desiredIndent = minimalIndent + 2

          const amountOfUselessSpaces = common(
            template.split('\n').filter(item => item.trim() !== ''),
          ).replace(/^(\s*).*/, '$1').length

          if (amountOfUselessSpaces > 0 && amountOfUselessSpaces < desiredIndent) {
            context.report({
              node,
              message: buildMessage(amountOfUselessSpaces),
              loc: buildLocation(
                [(node.loc.start.line + 1), 0],
                [(node.loc.start.line + 1), amountOfUselessSpaces],
              ),
            })

            return null
          }

          // We need to pass the template without not valuable spaces in the
          // beginning of each line
          const preparedTemplate = template
            .split('\n')
            .map(item => item.slice(desiredIndent))
            .join('\n')

          const result = linter.checkString(preparedTemplate, 'testfile')

          if (result.length) {
            result.forEach((error) => {
              const delta = error.line === 1
                // When template starts plus backtick
                ? node.quasi.quasis[0].loc.start.column + 1
                : desiredIndent - 1

              let columnStart = error.column + delta
              let columnEnd = error.column + delta
              let message = error.msg

              if (error.msg === 'Invalid indentation') {
                columnStart = 0
                columnEnd = preparedTemplate.split('\n')[error.line - 1].replace(/^(\s*).*/, '$1').length + desiredIndent
                message = buildMessage(columnEnd)
              }

              context.report({
                node,
                message,
                loc: buildLocation(
                  [(node.loc.start.line + error.line) - 1, columnStart],
                  [(node.loc.start.line + error.line) - 1, columnEnd],
                ),
              })
            })
          }
        }

        return null
      },
    }
  },
}
