/**
 * @fileoverview Manage empty lines in Pug
 * @author Eugene Zhlobo
 */

const { isReactPugReference, buildLocation, docsUrl } = require('../util/eslint')
const getTemplate = require('../util/getTemplate')
const getTokens = require('../util/getTokens')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const MESSAGE = {
  newline_start: 'Expected new line in the beginning',
  newline_end: 'Expected new line in the end',
  single_empty_lines: 'Use 1 empty line',
  need_empty_siblings: 'Need empty line for more than two siblings',
  need_empty_outdent: 'Need empty line when you are off from the scope',
}

const isLineEmpty = line => typeof line === 'string' && line.trim() === ''

const normalizeToken = token => ({
  type: '_nothing',
  loc: buildLocation([-1, -1], [-1, -1]),
  ...token,
})

module.exports = {
  meta: {
    docs: {
      description: 'Manage empty lines in Pug',
      category: 'Best Practices',
      recommended: true,
      url: docsUrl('empty-lines'),
    },
    schema: [],
  },

  create: function (context) {
    return {
      TaggedTemplateExpression: function (node) {
        if (isReactPugReference(node)) {
          // If multiline
          if (node.loc.start.line !== node.loc.end.line) {
            const template = getTemplate(node)
            const lines = template.split('\n')
            const tokens = getTokens(template)
            const eosToken = normalizeToken(tokens.find(token => token.type === 'eos'))

            // Group is a bunch of newline tokens between 'indent'/'outdent' tokens
            const newlineGroup = []

            // No new line in the beginning of template
            if (!isLineEmpty(lines[0])) {
              const firstLine = lines[0]

              context.report({
                node,
                loc: buildLocation(
                  [node.loc.start.line, node.quasi.loc.start.column],
                  [node.loc.start.line, node.quasi.loc.start.column + firstLine.length + 1],
                ),
                message: MESSAGE.newline_start,
              })
            }

            // No new line in the end of template
            if (!isLineEmpty(lines[lines.length - 1])) {
              const lastLine = lines[lines.length - 1]

              context.report({
                node,
                loc: buildLocation(
                  [node.loc.end.line, lastLine.search(/[^\s]/)],
                  [node.loc.end.line, node.loc.end.column],
                ),
                message: MESSAGE.newline_end,
              })
            }

            // No more than one empty line
            for (let index = 0; index < lines.length; index += 1) {
              if (isLineEmpty(lines[index]) && isLineEmpty(lines[index + 1])) {
                context.report({
                  node,
                  loc: buildLocation(
                    [node.loc.start.line + index, 0],
                    [node.loc.start.line + index + 1, 0],
                  ),
                  message: MESSAGE.single_empty_lines,
                })
              }
            }

            const eosTokenStringLocation = JSON.stringify(eosToken.loc)

            tokens.forEach((token, index) => {
              const nextToken = normalizeToken(tokens[index + 1])
              const prevToken = normalizeToken(tokens[index - 1])
              const beforePrevToken = normalizeToken(tokens[index - 2])

              if (
                token.type === 'outdent'
                && JSON.stringify(token.loc) !== eosTokenStringLocation
              ) {
                // When it goes out from nesting without empty line
                if (token.loc.start.line - prevToken.loc.end.line === 1) {
                  context.report({
                    node,
                    loc: buildLocation(
                      [node.loc.start.line + token.loc.start.line - 1, 0],
                      [node.loc.start.line + token.loc.start.line - 1, token.loc.end.column - 1],
                    ),
                    message: MESSAGE.need_empty_outdent,
                  })
                }
              }

              if (
                token.type === 'newline'

                // Don't include text-only lines
                && nextToken.type !== 'text'
                && !(prevToken.type === 'text' && beforePrevToken.type === 'newline')
              ) {
                newlineGroup.push({
                  ...token,
                  prev: prevToken,
                })
              }

              if (token.type === 'indent' || token.type === 'outdent') {
                if (newlineGroup.length >= 2) {
                  newlineGroup.forEach((item) => {
                    // If there is no empty line between siblings in newline group with more
                    // than 2 siblings
                    if (item.loc.start.line - item.prev.loc.end.line === 1) {
                      const line = item.loc.start.line + node.loc.start.line - 1

                      context.report({
                        node,
                        loc: buildLocation(
                          [line, 0],
                          [line, item.loc.end.column - 1],
                        ),
                        message: MESSAGE.need_empty_siblings,
                      })
                    }
                  })
                }

                // Reset the array
                newlineGroup.length = 0
              }
            })
          }
        }
      },
    }
  },
}
