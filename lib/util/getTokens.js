const lexer = require('pug-lexer')

module.exports = (template) => {
  try {
    return lexer(template)
  } catch (error) {
    return []
  }
}
