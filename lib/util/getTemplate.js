const PLACEHOLDER = '__eslint-react-pug__'

const getQuasiValue = ({ value }) => {
  if (value && typeof value === 'object') {
    return value.raw
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

const normalize = (template = '') => template
  .split('\n')
  .map(line => line.trimRight())
  .join('\n')

const getTemplateFromNode = ({ quasi }) => {
  const { quasis, expressions } = quasi

  if (expressions && expressions.length) {
    return getInterpolatedTemplate(quasis, expressions)
  }

  return getQuasiValue(quasis[0])
}

module.exports = node => normalize(getTemplateFromNode(node))
