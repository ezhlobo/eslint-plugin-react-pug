function doesStringLookLikeObject(string) {
  return /^\s*{/.test(string)
}

function normalize(value) {
  // Just an object (like `{ first: 'one' }`) is not valid string to
  // be parsed by babel, so we need to wrap it by braces
  if (typeof value === 'string' && doesStringLookLikeObject(value)) {
    return `(${value})`
  }

  // Pug can return a boolean variable for attribute value, but babel
  // can parses only strings
  return String(value)
}

function align(value, indent = 0) {
  if (!indent) {
    return value
  }

  return value
    .split('\n')
    .map(line => line.replace(new RegExp(`^\\s{${indent}}`), ''))
    .join('\n')
}

module.exports = {
  normalize,
  align,
}
