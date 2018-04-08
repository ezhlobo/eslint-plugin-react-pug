const fs = require('fs')
const path = require('path')
const { Linter } = require('eslint')

const customRules = fs.readdirSync(path.join(process.cwd(), 'lib/rules'))
  .reduce((files, filename) => {
    const key = `react-pug/${filename.replace(/\.js$/, '')}`

    // eslint-disable-next-line no-param-reassign, global-require, import/no-dynamic-require
    files[key] = require(path.join(process.cwd(), `lib/rules/${filename}`))

    return files
  }, {})

const linter = new Linter()

linter.defineRules(customRules)

const rulesSetting = Object.keys(customRules)
  .reduce((files, ruleName) => {
    // eslint-disable-next-line no-param-reassign
    files[ruleName] = 2
    return files
  }, {})

describe('broken-template', () => {
  const configuration = {
    globals: {
      pug: true,
    },
    parserOptions: {
      sourceType: 'module',
    },
    rules: rulesSetting,
  }

  it('does not throw an exception', () => {
    const template = `
      pug\`
        each item, index in 1, 2, 3]
      \`
    `

    linter.verify(template, configuration, 'foo.js')
  })
})
