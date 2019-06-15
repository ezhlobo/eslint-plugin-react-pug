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
  constructor() {
    this._props = []
  }

  defineProp(prop) {
    this._props.push({
      name: prop.name,
      loc: prop.loc,
    })
  }
}

class ComponentsManager {
  constructor() {
    this._components = {}
  }

  define(componentName) {
    this._components[componentName] = new ComponentManager()
  }

  get(componentName) {
    return this._components[componentName]
  }

  contain(componentName) {
    return Boolean(this.get(componentName))
  }
}
/* eslint-enable */

const Components = new ComponentsManager()

const findUpFunctionDeclaration = (node) => {
  let cursor = node

  while (cursor && cursor.type !== 'FunctionDeclaration') {
    cursor = cursor.parent
  }

  return cursor
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

  create: function () {
    return {
      // Find all pug template literals inside function declarations
      'FunctionDeclaration TaggedTemplateExpression[tag.name="pug"]': function (node) {
        const nodeFunction = findUpFunctionDeclaration(node)

        if (nodeFunction) {
          const functionName = nodeFunction.id.name

          Components.define(functionName)
        }
      },

      // We look for propTypes definition on the same level with function Declaration
      'FunctionDeclaration ~ ExpressionStatement > AssignmentExpression[operator="="][left.property.name="propTypes"]': function (node) {
        const componentName = node.left.object.name

        if (Components.contain(componentName)) {
          const Component = Components.get(componentName)

          node.right.properties.forEach((property) => {
            Component.defineProp(property.key)
          })
        }
      },
    }
  },
}
