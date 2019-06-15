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

  attachProp(prop) {
    this._props.push(prop)
  }

  usedProps(context) {
    const usedProps = []

    // Pick the variable declared as the first argument
    const propsArgumentDeclaration = context.getDeclaredVariables(this._declaration)[1]

    propsArgumentDeclaration.references.forEach((ref) => {
      const usage = ref.identifier.parent

      if (usage.type === 'MemberExpression') {
        usedProps.push({
          name: usage.property.name,
          loc: usage.property.loc,
        })
      }

      if (usage.type === 'VariableDeclarator') {
        usage.id.properties.forEach((property) => {
          usedProps.push({
            name: property.name,
            loc: property.loc,
          })
        })
      }
    })

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

    return {
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
          Component.attachProp(property)
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
          const usedProps = Component.usedProps(context)

          console.log(usedProps)
        })
      },
    }
  },
}
