/**
 * @fileoverview Add supporting of pugjs with react
 */

/* eslint-disable global-require */
const allRules = {
  'empty-lines': require('./lib/rules/empty-lines'),
  eslint: require('./lib/rules/eslint'),
  indent: require('./lib/rules/indent'),
  'no-broken-template': require('./lib/rules/no-broken-template'),
  'no-interpolation': require('./lib/rules/no-interpolation'),
  'no-undef': require('./lib/rules/no-undef'),
  'prop-types': require('./lib/rules/prop-types'),
  'pug-lint': require('./lib/rules/pug-lint'),
  quotes: require('./lib/rules/quotes'),
  'uses-react': require('./lib/rules/uses-react'),
  'uses-vars': require('./lib/rules/uses-vars'),
}
/* eslint-enable */

module.exports = {
  rules: allRules,
  configs: {
    all: {
      globals: {
        pug: true,
      },
      rules: {
        'react-pug/empty-lines': 2,
        'react-pug/eslint': 2,
        'react-pug/indent': 2,
        'react-pug/no-broken-template': 2,
        'react-pug/no-undef': 2,
        'react-pug/prop-types': 2,
        'react-pug/pug-lint': 2,
        'react-pug/no-interpolation': 2,
        'react-pug/quotes': 2,
        'react-pug/uses-react': 2,
        'react-pug/uses-vars': 2,
      },
    },
  },
}
