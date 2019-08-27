const { parse } = require('@babel/parser')
const traverse = require('@babel/traverse').default

const getVariables = require('../util/getVariables')
const getTokens = require('../util/getTokens')
const getCodeFromToken = require('../util/getCodeFromToken')
const babelHelpers = require('../util/babel')

const buildLocation = (startLine, startColumn, endLine, endColumn) => ({
  start: { line: startLine, column: startColumn },
  end: { line: endLine, column: endColumn },
})

const buildVariable = (name, allNames, loc, extra = {}) => ({
  name, allNames, loc, extra,
})

function getFullName(path) {
  const name = []

  if (path.isIdentifier()) {
    name.unshift(path.node.name)
  } else if (path.isStringLiteral()) {
    name.unshift(path.node.value)
  } else if (path.isMemberExpression()) {
    if (path.node.computed) {
      name.unshift('__COMPUTED_PROP__')
    }
    name.unshift(...getFullName(path.get('property')))
  }

  if (path.parentPath.isMemberExpression({ property: path.node })) {
    name.unshift(...getFullName(path.parentPath.get('object')))
  }

  return name
}

const getUsedVariablesInPug = (template = '') => {
  const usedVariables = []

  const variables = getVariables(template)
  const tokens = getTokens(template)
  const lines = template.split('\n')

  variables
    // Attach related token
    .map((variable) => {
      const relatedTokens = tokens
        .filter((token) => {
          const isAfterOpenBoundary = variable.loc.start.line === token.loc.start.line
            ? variable.loc.start.column >= token.loc.start.column - 1
            : variable.loc.start.line > token.loc.start.line

          const isBeforeCloseBoundary = variable.loc.end.line === token.loc.end.line
            ? variable.loc.end.column <= token.loc.end.column - 1
            : variable.loc.end.line < token.loc.end.line

          return isAfterOpenBoundary && isBeforeCloseBoundary
        })

      return { ...variable, token: relatedTokens[0] }
    })

    // Find all variables within the token
    .forEach((variable) => {
      const { token } = variable

      const code = getCodeFromToken(token)
      const isSpreadElement = code.startsWith('({...') && code.endsWith('})')
      const isObject = code.startsWith('{') && code.endsWith('}')
      const isVariableOnStartLine = token.loc.start.line === variable.loc.start.line

      const ast = parse(babelHelpers.normalize(code))

      let codeStartsAt = 0

      if (isVariableOnStartLine) {
        const codeFragment = code.split('\n')[0]
        const relatedLine = lines[variable.loc.start.line - 1]

        if (isSpreadElement) {
          // All Spread elements wrapped by ({ and }), so we remove them because
          // we don't have them in the template
          codeStartsAt = relatedLine.indexOf(codeFragment.substring(2, codeFragment.length - 2)) - 2
        } else if (isObject) {
          // All Objects wrapped by braces, so we remove them because we don't
          // have them in the templace
          codeStartsAt = relatedLine.indexOf(codeFragment) - 1
        } else {
          codeStartsAt = relatedLine.indexOf(codeFragment)
        }
      }

      // @TODO: We need to understand whether the prop used within spreading or not better,
      // for now when we see `...props.test` we mark both `props` and `test` with spreading,
      // while we should mark only `test`
      traverse(ast, {
        Identifier(path) {
          const loc = buildLocation(
            variable.loc.start.line,
            codeStartsAt + path.node.loc.start.column,
            variable.loc.end.line,
            codeStartsAt + path.node.loc.start.column + path.node.name.length,
          )

          if (path.parentPath.isMemberExpression()) {
            usedVariables.push(buildVariable(
              path.node.name,
              getFullName(path),
              loc,
            ))
          } else if (isSpreadElement) {
            usedVariables.push(buildVariable(
              path.node.name,
              getFullName(path),
              loc,
              { isSpreadElement },
            ))
          }
        },

        StringLiteral(path) {
          if (path.parentPath.isMemberExpression()) {
            const loc = buildLocation(
              variable.loc.start.line,
              codeStartsAt + path.node.loc.start.column,
              variable.loc.end.line,
              codeStartsAt + path.node.loc.start.column + path.node.extra.raw.length,
            )

            usedVariables.push(buildVariable(
              path.node.value,
              getFullName(path),
              loc,
            ))
          }
        },
      })

      const lastAddedVariable = usedVariables[usedVariables.length - 1]

      // If we define a scope with a variable connected to props in that definition,
      // we also mark all vars in that scope as used
      if (token.type === 'each' && lastAddedVariable) {
        const getLastTokenInScope = (all, start) => {
          const startIndex = all.findIndex(item => item === start)
          const lastToken = all.slice(startIndex).find(item => item.type === 'outdent' && item.loc.end.column <= start.loc.start.column)

          return lastToken
        }

        const startToken = token
        const endToken = getLastTokenInScope(tokens, startToken)

        const bodyLines = [''].concat(lines.slice(startToken.loc.start.line, endToken.loc.end.line - 1))
        const body = bodyLines.join('\n')

        const variablesInScope = getUsedVariablesInPug(body)
          .filter(item => item.allNames.length > 1 || item.extra.isSpreadElement === true)
          .map(item => ({
            ...item,
            loc: {
              start: {
                line: variable.loc.start.line + item.loc.start.line - 1,
                column: item.loc.start.column,
              },
              end: {
                line: variable.loc.start.line + item.loc.end.line - 1,
                column: item.loc.end.column,
              },
            },
            allNames: item.allNames[0] === token.val
              ? ['__COMPUTED_PROP__', ...item.allNames.slice(1)]
              : item.allNames,
          }))

        variablesInScope.forEach((item) => {
          usedVariables.push({
            ...item,
            allNames: [...lastAddedVariable.allNames, ...item.allNames],
          })
        })
      }
    })

  return usedVariables
}

module.exports = getUsedVariablesInPug
