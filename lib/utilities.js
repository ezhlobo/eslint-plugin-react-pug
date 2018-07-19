const { findVariablesInTemplate } = require('pug-uses-variables')

const PLACEHOLDER = '__eslint-react-pug__'

const getQuasiValue = ({ value }) => {
  if (value && typeof value === 'object') {
    return value.raw.trimRight()
  }

  return ''
}

const getInterpolatedTemplate = (template, interpolations) => template
  .map((quasi, index) => {
    const rawValue = getQuasiValue(quasi)

    // We need to stringify interpolation so babel will understand the code
    return interpolations[index] ? `${rawValue}"${PLACEHOLDER}"` : rawValue
  })
  .join('')

function isReactPugReference({ tag }) {
  return tag && tag.name === 'pug'
}

function getTemplate({ quasi }) {
  const { quasis, expressions } = quasi

  if (expressions && expressions.length) {
    return getInterpolatedTemplate(quasis, expressions)
  }

  return getQuasiValue(quasis[0])
}

function extractVariables(template) {
  try {
    return findVariablesInTemplate(template)
  } catch (e) {
    return []
  }
}

function buildLocation(startCoord, endCoord) {
  return {
    start: {
      line: startCoord[0],
      column: startCoord[1],
    },
    end: {
      line: endCoord[0],
      column: endCoord[1],
    },
  }
}

module.exports = {
  isReactPugReference,
  getTemplate,
  extractVariables,
  buildLocation,
}
