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

module.exports = ({ quasi }) => {
  const { quasis, expressions } = quasi

  if (expressions && expressions.length) {
    return getInterpolatedTemplate(quasis, expressions)
  }

  return getQuasiValue(quasis[0])
}
