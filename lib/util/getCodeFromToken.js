function isSpreadOperator(input) {
  return /^\.{3}[A-z0-9$]+(\.[A-z0-9$]+)*$/.test(input)
}

module.exports = function (token) {
  if (token.type === 'attribute' && isSpreadOperator(token.name)) {
    return `({${token.name}})`
  }

  if (token.type === 'each') {
    return token.code
  }

  return token.val
}
