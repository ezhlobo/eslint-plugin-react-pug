/**
 * @fileoverview Manage quotes in Pug
 * @author Eugene Zhlobo
 */

const { parse } = require('@babel/parser')
const codeWalk = require('@babel/traverse').default

const { isReactPugReference, buildLocation, docsUrl } = require('../util/eslint')
const getTemplate = require('../util/getTemplate')
const getTokens = require('../util/getTokens')
const ToggleBoolean = require('../util/ToggleBoolean')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const MESSAGE_DOUBLE = 'Strings must use double quotes'
const MESSAGE_SINGLE = 'Code must use single quotes'

const doesStringLookLikeObject = string => /^\s*{/.test(string)

const normalizeValue = (token) => {
  const value = token.code || token.val

  // Just an object (like `{ first: 'one' }`) is not valid string to
  // be parsed by babel, so we need to wrap it by braces
  if (typeof value === 'string' && doesStringLookLikeObject(value)) {
    return `(${value})`
  }

  // Pug can return a boolean variable for attribute value, but babel
  // can parses only strings
  return String(value)
}

const isStringValid = (string, singleQuote) => {
  const check = singleQuote
    ? /^'.*'$/
    : /^".*"$/

  return check.test(string)
}

module.exports = {
  meta: {
    docs: {
      description: 'Manage quotes in Pug',
      category: 'Best Practices',
      recommended: true,
      url: docsUrl('quotes'),
    },
    schema: [],
  },

  create: function (context) {
    return {
      TaggedTemplateExpression: function (node) {
        if (isReactPugReference(node)) {
          const withWrongQuotes = []

          const template = getTemplate(node)
          const tokens = getTokens(template)

          tokens.forEach((token) => {
            if (
              token.type === 'attribute'
              || token.type === 'code'
              || token.type === 'interpolated-code'
              || token.type === 'each'
            ) {
              const normalizedValue = normalizeValue(token)
              const code = parse(normalizedValue)

              const isCode = new ToggleBoolean()

              const checkString = (path) => {
                const doesNeedSingleQuote = (
                  isCode.check()

                  // Code in template
                  || token.type === 'code'
                  || token.type === 'interpolated-code'
                  || token.type === 'each'
                )

                const rawValue = path.node.extra.raw

                if (isStringValid(rawValue, doesNeedSingleQuote)) {
                  return false
                }

                const tokenStartAt = token.loc.start.column - 1
                const tokenEndAt = token.loc.end.column

                const tokenLine = template.split('\n').splice(token.loc.start.line - 1, 1)[0]
                const tokenSource = tokenLine.slice(tokenStartAt, tokenEndAt)

                const valueStartAt = tokenStartAt + tokenSource.indexOf(rawValue)
                const valueEndAt = valueStartAt + rawValue.length

                withWrongQuotes.push({
                  singleQuote: doesNeedSingleQuote,
                  loc: buildLocation(
                    [token.loc.start.line, valueStartAt],
                    [token.loc.end.line, valueEndAt],
                  ),
                })

                return null
              }

              codeWalk(code, {
                ObjectExpression: isCode.on,
                ArrayExpression: isCode.on,
                CallExpression: isCode.on,

                StringLiteral: checkString,
                DirectiveLiteral: checkString,
              })
            }
          })

          withWrongQuotes.forEach((variable) => {
            const delta = variable.loc.start.line === 1
              // When template starts plus backtick
              ? node.quasi.quasis[0].loc.start.column + 1
              : -1

            const columnStart = variable.loc.start.column + delta
            const columnEnd = variable.loc.end.column + delta

            context.report({
              node,
              loc: buildLocation(
                [(node.loc.start.line + variable.loc.start.line) - 1, columnStart + 1],
                [(node.loc.start.line + variable.loc.end.line) - 1, columnEnd + 1],
              ),
              message: variable.singleQuote ? MESSAGE_SINGLE : MESSAGE_DOUBLE,
            })
          })
        }
      },
    }
  },
}
