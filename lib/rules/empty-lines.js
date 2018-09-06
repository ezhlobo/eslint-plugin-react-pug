/**
 * @fileoverview Manage empty lines in Pug
 * @author Eugene Zhlobo
 */

const { isReactPugReference, buildLocation, docsUrl } = require('../util/eslint')
const getTemplate = require('../util/getTemplate')
const getTokens = require('../util/getTokens')
const normalizeToken = require('../util/normalizeToken')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const MESSAGE = {
  newline_start: 'Expected new line in the beginning',
  newline_end: 'Expected new line in the end',
  single_empty_lines: 'Use 1 empty line',
  no_lines_indent: 'Expected no empty lines for nested items',
  need_empty_siblings: 'Need empty line for more than two siblings',
  need_empty_outdent: 'Need empty line when you are off from the scope',
}

const isLineEmpty = line => typeof line === 'string' && line.trim() === ''

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

            // Don't treat attributes only as a multiline template
            if (
              normalizeToken(tokens[0]).type === 'tag'
              && normalizeToken(tokens[1]).type === 'start-attributes'
              && normalizeToken(tokens[tokens.length - 2]).type === 'end-attributes'
              && normalizeToken(tokens[tokens.length - 1]).type === 'eos'
            ) return

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

              const prevPrevToken = normalizeToken(tokens[index - 2])

              if (
                // When it goes out from nesting without empty line
                (
                  token.type === 'outdent'
                  && JSON.stringify(token.loc) !== eosTokenStringLocation
                  && token.loc.start.line - prevToken.loc.end.line === 1
                )

                // When it goes out from text block
                || (
                  token.type === 'newline'
                  && prevToken.type === 'end-pipeless-text'
                  && !(prevPrevToken.type === 'text' && prevPrevToken.val === '')
                )
              ) {
                context.report({
                  node,
                  loc: buildLocation(
                    [node.loc.start.line + token.loc.start.line - 1, 0],
                    [node.loc.start.line + token.loc.start.line - 1, token.loc.end.column - 1],
                  ),
                  message: MESSAGE.need_empty_outdent,
                })
              }

              if (token.type === 'indent') {
                // Prohibit empty lines for nested items
                if (prevToken.type && token.loc.start.line - prevToken.loc.start.line > 1) {
                  const startLine = node.loc.start.line + prevToken.loc.end.line - 1
                  const endLine = node.loc.start.line + token.loc.end.line - 1

                  context.report({
                    node,
                    loc: buildLocation(
                      [startLine, prevToken.loc.end.column - 1],
                      [endLine, token.loc.end.column - 1],
                    ),
                    message: MESSAGE.no_lines_indent,
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

              if (
                token.type === 'indent' || token.type === 'outdent'
                || (token.type === 'newline' && prevToken.type === 'end-pipeless-text')
              ) {
                if (newlineGroup.length >= 2) {
                  newlineGroup.forEach((item) => {
                    const endLine = item.prev.type === 'end-pipeless-text'
                      ? item.prev.loc.end.line - 1
                      : item.prev.loc.end.line

                    // If there is no empty line between siblings in newline group with more
                    // than 2 siblings
                    if (item.loc.start.line - endLine === 1) {
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
