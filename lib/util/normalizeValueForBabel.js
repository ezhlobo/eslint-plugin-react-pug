function doesStringLookLikeObject(string) {
  return /^\s*{/.test(string)
}

function normalizeValueForBabel(value) {
  // Just an object (like `{ first: 'one' }`) is not valid string to
  // be parsed by babel, so we need to wrap it by braces
  if (typeof value === 'string' && doesStringLookLikeObject(value)) {
    return `(${value})`
  }

  // Pug can return a boolean variable for attribute value, but babel
  // can parses only strings
  return String(value)
}

module.exports = (value, extraIndent = 0) => {
  const normalizedValue = normalizeValueForBabel(value)

  if (!extraIndent) {
    return normalizedValue
  }

  return normalizedValue
    .split('\n')
    .map(line => line.replace(new RegExp(`^\\s{${extraIndent}}`), ''))
    .join('\n')
}
