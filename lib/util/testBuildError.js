/* eslint-disable prefer-destructuring */

module.exports = (startCoord = [], endCoord = [], message) => {
  const result = {}

  if (startCoord[0]) {
    result.line = startCoord[0]
  }

  if (startCoord[1]) {
    result.column = startCoord[1]
  }

  if (endCoord[0]) {
    result.endLine = endCoord[0]
  }

  if (endCoord[1]) {
    result.endColumn = endCoord[1]
  }

  if (message) {
    result.message = message
  }

  return result
}
