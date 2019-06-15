/**
 * @fileoverview
 * @author Eugene Zhlobo
 */

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
        callback({
          name: usage.property.name,
          loc: usage.property.loc,
        })
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
    const usedProps = []

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
}

class ComponentsManager {
  constructor() {
    this._list = []
  }

  define(name, path) {
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

  // get(name) {
  //   return this._list[name]
  // }

  // contain(name) {
  //   return Boolean(this.get(name))
  // }
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
    const maybeComponents = []

    const UNUSED_MESSAGE = '\'{{name}}\' PropType is defined but prop is never used'
    // const MISSING_MESSAGE = '\'{{name}}\' is missing in props validation'

    return {
      'TaggedTemplateExpression[tag.name="pug"]': function () {
        // Need to extract variables from Pug template
      },

      FunctionDeclaration: function (node) {
        const componentName = node.id.name
        const path = getNodePath(node)

        maybeComponents.push({ name: componentName, path, ref: node })
      },

      'FunctionDeclaration ~ ExpressionStatement > AssignmentExpression[operator="="][left.property.name="propTypes"]': function (node) {
        const componentName = node.left.object.name
        const path = getNodePath(node.parent)

        const Component = Components.define(componentName, path)

        // Attach related props

        node.right.properties.forEach((property) => {
          Component.attachPropDef(property)
        })

        // Attach related declaration

        const relatedDeclaration = maybeComponents.find(item => (
          item.name === Component.name && item.path === Component.path
        ))

        if (relatedDeclaration) {
          Component.attachDeclaration(relatedDeclaration.ref)
        }
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
