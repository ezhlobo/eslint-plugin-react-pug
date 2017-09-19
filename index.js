/**
 * @fileoverview Add supporting of pugjs with react
 * @author
 */
"use strict";

const allRules = {
  'uses-react': require('./lib/rules/uses-react'),
  'uses-vars': require('./lib/rules/uses-vars'),
}

module.exports = {
  rules: allRules,
  configs: {
    all: {
      globals: {
        pug: true,
      },
      rules: {
        'react-pug/uses-react': 2,
        'react-pug/uses-vars': 2,
      },
    },
  },
}
