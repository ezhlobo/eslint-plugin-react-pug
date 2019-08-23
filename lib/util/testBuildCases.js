const isOnly = item => item.only

const hasOnlyInside = item => (
  item.only
  || (Array.isArray(item.valid) && item.valid.some(isOnly))
  || (Array.isArray(item.invalid) && item.invalid.some(isOnly))
)

const hasOnly = (cases) => {
  const contain = cases.some(hasOnlyInside)

  return contain
}

const pickFilteredCode = (item, type) => {
  if (Array.isArray(item[type])) {
    return item[type].filter(isOnly)
  }

  return item[type] && item[type].only ? item[type] : null
}

const extractCases = (cases, type) => {
  const filteredCases = hasOnly(cases)
    ? cases.filter(hasOnlyInside).map(item => ({
      valid: pickFilteredCode(item, 'valid'),
      invalid: pickFilteredCode(item, 'invalid'),
    }))
    : cases

  return filteredCases.reduce((items, item) => {
    if (!item[type]) {
      return items
    }

    if (Array.isArray(item[type])) {
      return items.concat(item[type].map(subItem => ({
        options: item.options || [],
        code: subItem.code,
        errors: subItem.errors,
      })))
    }

    items.push({
      options: item.options || [],
      code: item[type].code,
      errors: item[type].errors,
    })

    return items
  }, [])
}

module.exports = function (cases) {
  return {
    valid: extractCases(cases, 'valid'),
    invalid: extractCases(cases, 'invalid'),
  }
}
