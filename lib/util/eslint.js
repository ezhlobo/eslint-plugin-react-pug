function docsUrl(ruleName) {
  return `https://github.com/ezhlobo/eslint-plugin-react-pug/blob/master/docs/rules/${ruleName}.md`
}

function buildLocation(startCoord, endCoord) {
  return {
    start: {
      line: startCoord[0],
      column: startCoord[1],
    },
    end: {
      line: endCoord[0],
      column: endCoord[1],
    },
  }
}

function isReactPugReference({ tag }) {
  return tag && tag.name === 'pug'
}

module.exports = {
  docsUrl,
  buildLocation,

  isReactPugReference,
}
