/* eslint-disable no-param-reassign */

const Components = require('eslint-plugin-react/lib/util/Components')

const supportedComponentDeclarationTypes = [
  'ArrowFunctionExpression',
  'FunctionDeclaration',
  'FunctionExpression',
]

const { parse } = require('@babel/parser')
const traverse = require('@babel/traverse').default

const { isReactPugReference } = require('./eslint')
const getTemplate = require('../util/getTemplate')
const getTokens = require('../util/getTokens')
const getVariables = require('../util/getVariables')
const getCodeFromToken = require('../util/getCodeFromToken')
const babelHelpers = require('../util/babel')

const ITEM_TYPE_VARIABLE = 'Variable'
const ITEM_TYPE_OBJECT = 'Object'
const buildItem = (type, name, payload = {}) => ({ type, name, payload })

function goThroughReferences(references, { context, callback }) {
  references.forEach((ref) => {
    const usage = ref.identifier && ref.identifier.parent

    if (usage && usage.type === 'MemberExpression' && usage.object === ref.identifier) {
      callback(buildItem(ITEM_TYPE_OBJECT, usage.property.name, {
        objectName: ref.identifier.name,
      }))
    }

    if (usage && usage.type === 'VariableDeclarator' && usage.init === ref.identifier) {
      if (usage.id.type === 'Identifier') {
        callback(buildItem(ITEM_TYPE_VARIABLE, usage.id.name))

        const nestedVariables = context.getDeclaredVariables(usage)
          .find(item => item.name === usage.id.name)

        if (nestedVariables && nestedVariables.references) {
          goThroughReferences(
            nestedVariables.references.filter(item => item.identifier !== usage.id),
            { context, callback },
          )
        }
      }

      if (usage.id.type === 'ObjectPattern') {
        usage.id.properties.forEach((property) => {
          if (property.type === 'Property') {
            callback(buildItem(ITEM_TYPE_VARIABLE, property.key.name))
          } else if (property.type === 'RestElement') {
            callback(buildItem(ITEM_TYPE_OBJECT, property.argument.name))

            const nestedVariables = context.getDeclaredVariables(usage)
              .find(item => item.name === property.argument.name)

            if (nestedVariables && nestedVariables.references) {
              goThroughReferences(nestedVariables.references, { context, callback })
            }
          }
        })
      }
    }
  })
}

module.exports = rule => Components.detect((context, components, utils) => {
  // Once any function returns JSX it starts being treated as component, we
  // extend its internals to return `true` when it contains pug
  const originalUtilsIsReturningJSX = utils.isReturningJSX.bind(utils)
  utils.isReturningJSX = (ASTNode, strict) => {
    const nodeAndProperty = utils.getReturnPropertyAndNode(ASTNode)
    const { node, property } = nodeAndProperty

    if (!node) {
      return false
    }

    const returnsPug = node[property] && isReactPugReference(node[property])

    return originalUtilsIsReturningJSX(ASTNode, strict) || returnsPug
  }

  // We need to filter out components that are not supported by us
  const originalComponentsList = components.list.bind(components)
  components.list = () => {
    const list = originalComponentsList()
    const filteredList = {}

    Object.keys(list)
      .forEach((id) => {
        if (list[id].node.type !== 'ClassDeclaration') {
          filteredList[id] = list[id]
        }
      })

    return filteredList
  }

  function buildUsedProp(name, node = {}) {
    return {
      allNames: [name],
      name,
      node,
    }
  }

  function markPropsUsedInsidePug(component, variables) {
    const usedProps = []

    const callback = (item) => {
      const usedSpreadInPug = variables.find(variable => variable.name === item.name)
      if (usedSpreadInPug && !usedSpreadInPug.parentObject && usedSpreadInPug.isSpreadElement) {
        component.hasPropsSpreadingInPug = true
      }

      const usedObjectInPug = variables.filter(variable => variable.parentObject === item.name)
      if (usedObjectInPug.length) {
        usedObjectInPug.forEach((variable) => {
          usedProps.push(buildUsedProp(variable.name, variable))
        })
      }
    }

    if (supportedComponentDeclarationTypes.includes(component.node.type)) {
      const firstArgument = component.node.params[0]
      const declaredVariables = context.getDeclaredVariables(component.node)

      if (firstArgument && firstArgument.type === 'Identifier') {
        // `getDeclaredVariables` executed for FunctionDeclaration returns
        // function name as the first argument, so we should skip it to get
        // props declaration
        const propsRefDeclarationIndex = component.node.type === 'FunctionDeclaration' ? 1 : 0

        const propsRefDeclaration = declaredVariables[propsRefDeclarationIndex]

        callback(buildItem(ITEM_TYPE_VARIABLE, firstArgument.name))
        goThroughReferences(propsRefDeclaration.references, { context, callback })
      }

      if (firstArgument && firstArgument.type === 'ObjectPattern') {
        firstArgument.properties.forEach((property) => {
          if (property.type === 'RestElement') {
            callback(buildItem(ITEM_TYPE_OBJECT, property.argument.name))

            const restPropsDeclaration = declaredVariables
              .find(item => item.name === property.argument.name)

            if (restPropsDeclaration && restPropsDeclaration.references) {
              goThroughReferences(restPropsDeclaration.references, { context, callback })
            }
          }
        })
      }
    }

    components.set(component.node, {
      usedPropTypes: usedProps,
    })
  }

  return {
    ...rule(context, components, utils),

    'TaggedTemplateExpression[tag.name="pug"]': function (node) {
      const relatedComponentNode = utils.getParentStatelessComponent()
      const relatedComponent = components.get(relatedComponentNode)

      if (relatedComponentNode && relatedComponent) {
        const template = getTemplate(node)
        const variables = getVariables(template)
        const tokens = getTokens(template)
        const lines = template.split('\n')

        const variablesWithTokens = variables
          // We find all tokens which embrace variables and attach the to
          // variable object
          .map((variable) => {
            const relatedTokens = tokens.filter(token => (
              variable.loc.start.line >= token.loc.start.line
              && variable.loc.end.line <= token.loc.end.line
              && variable.loc.start.column >= token.loc.start.column - 1
              && variable.loc.end.column <= token.loc.end.column - 1
            ))

            return { ...variable, tokens: relatedTokens }
          })
          // We filter out all variables which don't have
          .filter(variable => variable.tokens.length > 0)

        const usedVariables = []

        variablesWithTokens.forEach((variable) => {
          // We support cases only when variables defined within one token
          const token = variable.tokens[0]

          // We call it code because we know that somewhere inside we use
          // variables
          const code = getCodeFromToken(token)

          const ast = parse(babelHelpers.normalize(code))

          const buildUsedVariableLocation = (name) => {
            const nameStartsAt = lines[variable.loc.start.line - 1]
              .substring(variable.loc.start.column + variable.value.length)
              .indexOf(name)

            const variableEndsAt = variable.loc.start.column + variable.value.length
            const columnStart = variableEndsAt + nameStartsAt
            const columnEnd = columnStart + name.length

            return {
              start: {
                line: node.loc.start.line + token.loc.start.line - 1,
                column: columnStart,
              },
              end: {
                line: node.loc.start.line + token.loc.end.line - 1,
                column: columnEnd,
              },
            }
          }

          traverse(ast, {
            Identifier(path) {
              if (path.isIdentifier({ name: variable.value })) {
                if (path.parentPath.isMemberExpression({ object: path.node })) {
                  const property = path.parentPath.get('property')

                  if (property.isStringLiteral()) {
                    usedVariables.push({
                      parentObject: variable.value,
                      name: property.node.value,
                      loc: buildUsedVariableLocation(property.node.extra.raw),
                    })
                  }

                  if (property.isIdentifier()) {
                    usedVariables.push({
                      parentObject: variable.value,
                      name: property.node.name,
                      loc: buildUsedVariableLocation(property.node.name),
                    })
                  }
                } else if (path.parentPath.isSpreadElement()) {
                  const argumentName = path.parentPath.node.argument
                    && path.parentPath.node.argument.name

                  if (argumentName) {
                    usedVariables.push({
                      parentObject: null,
                      name: argumentName,
                      isSpreadElement: true,
                    })
                  }
                }
              }
            },
          })
        })

        markPropsUsedInsidePug(relatedComponent, usedVariables)
      }
    },
  }
})
