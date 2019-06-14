const extractCase = type => item => ({
  options: item.options || [],
  ...item[type],
})

const extractCases = type => (items) => {
  if (items.some(item => item.only)) {
    return items.filter(item => item.only).map(extractCase(type))
  }

  return items.map(extractCase(type))
}

module.exports = function (cases) {
  return {
    valid: extractCases('valid')(cases),
    invalid: extractCases('invalid')(cases),
  }
}
