const { findVariablesInTemplate } = require('pug-uses-variables')

module.exports = (template) => {
  try {
    return findVariablesInTemplate(template)
  } catch (error) {
    return []
  }
}
