const { parse } = require('@babel/parser')
const traverse = require('@babel/traverse').default

const getTemplate = require('../util/getTemplate')
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

module.exports = (taggedTemplateExpression) => {
  const usedVariables = []

  const template = getTemplate(taggedTemplateExpression)
  const variables = getVariables(template)
  const tokens = getTokens(template)
  const lines = template.split('\n')

  variables
    // Attach related token
    .map((variable) => {
      const relatedTokens = tokens
        .filter(token => (
          variable.loc.start.line >= token.loc.start.line
          && variable.loc.end.line <= token.loc.end.line
          && variable.loc.start.column >= token.loc.start.column - 1
          && variable.loc.end.column <= token.loc.end.column - 1
        ))

      return { ...variable, token: relatedTokens[0] }
    })

    // Find all variables within the token
    .forEach((variable) => {
      const { token } = variable
      const code = getCodeFromToken(token)
      const isSpreadElement = code.startsWith('({...') && code.endsWith('})')

      const ast = parse(babelHelpers.normalize(code))

      const codeStartsAt = isSpreadElement
        // If we have some enhancements to handle spread attributes, we should
        // get back to the initial state
        ? lines[variable.loc.start.line - 1].indexOf(code.substring(2, code.length - 2)) - 2
        : lines[variable.loc.start.line - 1].indexOf(code)

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
    })

  return usedVariables
}
