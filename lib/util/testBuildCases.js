const extractCases = (cases, type) => {
  const filteredCases = cases.some(item => item.only)
    ? cases.filter(item => item.only)
    : cases

  return filteredCases.reduce((items, item) => {
    if (!item[type]) {
      return items
    }

    if (Array.isArray(item[type])) {
      return items.concat(item[type].map(subItem => ({
        options: item.options || [],
        ...subItem,
      })))
    }

    items.push({
      options: item.options || [],
      ...item[type],
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
