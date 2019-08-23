/**
 * @fileoverview Prevent definitions of unused prop types and prevent missing props validation
 * @author Eugene Zhlobo
 */

const { docsUrl } = require('../util/eslint')
const detectComponents = require('../util/detectComponents')
const { createReportUndeclaredPropTypes, createReportUnusedPropTypes } = require('../util/eslint-plugin-react.utils')

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
    const defaults = { skipShapeProps: false, customValidators: [] }
    const configuration = Object.assign({}, defaults, context.options[0] || {})

    const reportUndeclaredPropTypes = createReportUndeclaredPropTypes(
      context, components, configuration,
    )

    const reportUnusedPropTypes = createReportUnusedPropTypes(
      context, components, configuration,
    )

    function doesNotHavePropsSpreadingInPug(component) {
      return component && !component.hasPropsSpreadingInPug
    }

    return {
      'Program:exit': function () {
        const list = components.list()

        Object.keys(list)
          .filter(id => doesNotHavePropsSpreadingInPug(list[id]))
          .forEach((id) => {
            const component = list[id]

            reportUnusedPropTypes(component)
            reportUndeclaredPropTypes(component)
          })
      },
    }
  }),
}
