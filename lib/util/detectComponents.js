/* eslint-disable no-param-reassign */

const Components = require('eslint-plugin-react/lib/util/Components')

const { isReactPugReference } = require('./eslint')
const getUsedVariablesInPug = require('./getUsedVariablesInPug')
const getTemplate = require('../util/getTemplate')
const getPropsRefs = require('./getPropsRefs')

const isSupportedComponentDeclaration = node => [
  'ArrowFunctionExpression',
  'FunctionDeclaration',
  'FunctionExpression',
].includes(node.type)

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
        if (isSupportedComponentDeclaration(list[id].node)) {
          filteredList[id] = list[id]
        }
      })

    return filteredList
  }

  function markPropsUsedInsidePug(component, variables) {
    const usedPropTypes = []

    variables
      .forEach((variable) => {
        usedPropTypes.push({
          name: variable.name,
          allNames: variable.allNames.slice(1),
          node: {
            loc: variable.loc,
          },
        })
      })

    components.set(component.node, { usedPropTypes })
  }

  return {
    ...rule(context, components, utils),

    'TaggedTemplateExpression[tag.name="pug"]': function (node) {
      const relatedComponentNode = utils.getParentStatelessComponent()
      const relatedComponent = components.get(relatedComponentNode)

      if (relatedComponent && isSupportedComponentDeclaration(relatedComponentNode)) {
        const propsRefsNames = getPropsRefs(context, relatedComponent)

        const template = getTemplate(node)
        const usedVariables = getUsedVariablesInPug(template)
          .map(variable => ({
            ...variable,
            loc: {
              start: {
                ...variable.loc.start,
                line: node.loc.start.line + variable.loc.start.line - 1,
              },
              end: {
                ...variable.loc.end,
                line: node.loc.start.line + variable.loc.end.line - 1,
              },
            },
          }))

        // Check if we use props reference with spreading, then we consider
        // that we use all props
        if (
          usedVariables.find(item => item.extra.isSpreadElement
          && propsRefsNames.indexOf(item.name) > -1)
        ) {
          relatedComponent.hasPropsSpreadingInPug = true
          return
        }

        const usedProps = usedVariables
          // Filter out everything not related to props
          .filter(variable => propsRefsNames.indexOf(variable.allNames[0]) > -1)

          // Remove duplicates
          .reduce((uniq, variable) => {
            if (!uniq.find(item => item.allNames.join('.') === variable.allNames.join('.'))) {
              uniq.push(variable)
            }

            return uniq
          }, [])

        markPropsUsedInsidePug(relatedComponent, usedProps)
      }
    },
  }
})
