/**
 * @fileoverview
 * @author Eugene Zhlobo
 */

const { docsUrl } = require('../util/eslint')
const detectComponents = require('../util/detectComponents')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

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

  create: detectComponents((context, components) => {
    const defaults = { skipShapeProps: true, customValidators: [] }
    const configuration = Object.assign({}, defaults, context.options[0] || {})
    const UNUSED_MESSAGE = '\'{{name}}\' PropType is defined but prop is never used'

    function isPropUsed(node, prop) {
      const usedPropTypes = node.usedPropTypes || []
      for (let i = 0, l = usedPropTypes.length; i < l; i += 1) {
        const usedProp = usedPropTypes[i]
        if (
          prop.type === 'shape' ||
          prop.name === '__ANY_KEY__' ||
          usedProp.name === prop.name
        ) {
          return true
        }
      }

      return false
    }

    function reportUnusedPropType(component, props) {
      // Skip props that check instances
      if (props === true) {
        return
      }

      Object.keys(props || {}).forEach((key) => {
        const prop = props[key]
        // Skip props that check instances
        if (prop === true) {
          return
        }

        if (prop.type === 'shape' && configuration.skipShapeProps) {
          return
        }

        if (prop.node && !isPropUsed(component, prop)) {
          context.report({
            node: prop.node.value || prop.node,
            message: UNUSED_MESSAGE,
            data: {
              name: prop.fullName,
            },
          })
        }

        if (prop.children) {
          reportUnusedPropType(component, prop.children)
        }
      })
    }

    function reportUnusedPropTypes(component) {
      reportUnusedPropType(component, component.declaredPropTypes)
    }

    function doesNotHavePropsSpreadingInPug(component) {
      return component && !component.hasPropsSpreadingInPug
    }

    return {
      'Program:exit': function () {
        const list = components.list()

        Object.keys(list)
          .filter(id => list[id].node.type !== 'ClassDeclaration')
          .filter(id => doesNotHavePropsSpreadingInPug(list[id]))
          .forEach((id) => {
            reportUnusedPropTypes(list[id])
          })
      },
    }
  }),
}
