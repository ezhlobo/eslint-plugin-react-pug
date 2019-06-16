/**
 * @fileoverview
 * @author Eugene Zhlobo
 */

const { parse } = require('@babel/parser')
const traverse = require('@babel/traverse').default

const { isReactPugReference, buildLocation, docsUrl } = require('../util/eslint')
const getTemplate = require('../util/getTemplate')
const getTokens = require('../util/getTokens')
const getVariables = require('../util/getVariables')
const babelHelpers = require('../util/babel')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

function processReferences(variable, getVariablesIn, callback) {
  if (variable && Array.isArray(variable.references)) {
    variable.references.forEach((ref) => {
      const usage = ref.identifier.parent

      if (usage.type === 'MemberExpression') {
        if (usage.property.type === 'Identifier') {
          callback({
            name: usage.property.name,
            loc: usage.property.loc,
          })
        } else if (usage.property.type === 'Literal') {
          callback({
            name: usage.property.value,
            loc: usage.property.loc,
          })
        }
      }

      if (usage.type === 'VariableDeclarator') {
        usage.id.properties.forEach((property) => {
          if (property.type === 'Property') {
            callback({
              name: property.key.name,
              loc: property.key.loc,
            })
          } else if (property.type === 'RestElement') {
            const nestedVariable = getVariablesIn(usage)
              .find(item => item.name === property.argument.name)

            processReferences(nestedVariable, getVariablesIn, callback)
          }
        })
      }
    })
  }
}

/* eslint-disable no-underscore-dangle */
class ComponentManager {
  constructor(params) {
    this.name = params.name
    this.path = params.path

    this._declaration = null

    this._props = []

    this._manuallyUsedProps = []
  }

  attachDeclaration(declaration) {
    this._declaration = declaration
  }

  attachPropDef(prop) {
    this._props.push({
      name: prop.key.name,
      loc: prop.key.loc,
    })
  }

  propsDefs() {
    return this._props
  }

  usedProps(context) {
    const usedProps = [].concat(this._manuallyUsedProps)

    // Pick the variable declared as the first argument
    const propsArgumentDeclaration = context.getDeclaredVariables(this._declaration)[1]

    processReferences(
      propsArgumentDeclaration,
      context.getDeclaredVariables,
      (item) => {
        usedProps.push(item)
      },
    )

    return usedProps
  }

  markPropAsUsed(name) {
    this._manuallyUsedProps.push({ name })
  }
}

class ComponentsManager {
  constructor() {
    this._list = []
  }

  define(name, path) {
    const existedComponent = this._list.find(item => item.name === name && item.path === path)

    if (existedComponent) {
      return existedComponent
    }

    const Component = new ComponentManager({
      name,
      path,
    })

    this._list.push(Component)

    return Component
  }

  forEach(callback) {
    return this._list.forEach(callback)
  }
}
/* eslint-enable */

const getNodePath = (node) => {
  let cursor = node.parent
  let path = cursor.type

  while (cursor.parent) {
    cursor = cursor.parent
    path = `${cursor.type}/${path}`
  }

  return path
}

const findUpNode = (node, targetType) => {
  let cursor = node

  while (cursor && cursor.type !== targetType) {
    cursor = cursor.parent
  }

  return cursor
}

function isSpreadOperator(input) {
  return /^\.{3}[A-z0-9$]+(\.[A-z0-9$]+)*$/.test(input)
}

function getCodeFromPugToken(token) {
  if (token.type === 'attribute' && isSpreadOperator(token.name)) {
    return `({${token.name}})`
  }

  if (token.type === 'each') {
    return token.code
  }

  return token.val
}

module.exports = {
  meta: {
    docs: {
      description: '',
      category: '',
      recommended: true,
      url: docsUrl('prop-types'),
    },
    schema: [],
  },

  create: function (context) {
    const Components = new ComponentsManager()

    const UNUSED_MESSAGE = '\'{{name}}\' PropType is defined but prop is never used'
    // const MISSING_MESSAGE = '\'{{name}}\' is missing in props validation'

    return {
      FunctionDeclaration: function (node) {
        if (node.id) {
          const componentName = node.id.name
          const treePath = getNodePath(node)

          const Component = Components.define(componentName, treePath)

          Component.attachDeclaration(node)
        }
      },

      'TaggedTemplateExpression[tag.name="pug"]': function (node) {
        const functionNode = findUpNode(node, 'FunctionDeclaration')
        if (functionNode) {
          const componentName = functionNode.id.name
          const treePath = getNodePath(functionNode)

          const Component = Components.define(componentName, treePath)

          const template = getTemplate(node)
          const variables = getVariables(template)
          const tokens = getTokens(template)

          const tokensWithVars = tokens
            .map((token) => {
              const relatedVariables = variables
                .filter(variable => (
                  variable.loc.start.line >= token.loc.start.line
                  && variable.loc.end.line <= token.loc.end.line
                  && variable.loc.start.column >= token.loc.start.column - 1
                  && variable.loc.end.column <= token.loc.end.column - 1
                ))

              return { ...token, variables: relatedVariables }
            })
            .filter(item => item.variables.length > 0)

          tokensWithVars.forEach((token) => {
            const input = getCodeFromPugToken(token)

            token.variables.forEach((variable) => {
              const ast = parse(babelHelpers.normalize(input))

              traverse(ast, {
                Identifier(path) {
                  if (path.isIdentifier({ name: variable.value })) {
                    if (path.parentPath.isMemberExpression({ object: path.node })) {
                      const property = path.parentPath.get('property')

                      if (property.isLiteral()) {
                        Component.markPropAsUsed(property.node.value)
                      }

                      if (property.isIdentifier()) {
                        Component.markPropAsUsed(property.node.name)
                      }
                    } else {
                      Component.markPropAsUsed(variable.value)
                    }
                  }
                },
              })
            })
          })
        }
      },

      'FunctionDeclaration ~ ExpressionStatement > AssignmentExpression[operator="="][left.property.name="propTypes"]': function (node) {
        const componentName = node.left.object.name
        const treePath = getNodePath(node.parent)

        const Component = Components.define(componentName, treePath)

        // Attach related props

        node.right.properties.forEach((property) => {
          Component.attachPropDef(property)
        })
      },

      'Program:exit': function () {
        Components.forEach((Component) => {
          const propsDefs = Component.propsDefs()
          const usedProps = Component.usedProps(context)

          propsDefs.forEach((definition) => {
            if (!usedProps.find(item => item.name === definition.name)) {
              context.report({
                node: definition,
                message: UNUSED_MESSAGE,
                data: {
                  name: definition.name,
                },
              })
            }
          })
        })
      },
    }
  },
}
