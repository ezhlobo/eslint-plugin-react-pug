/**
 * @fileoverview Add supporting of pugjs with react
 * @author
 */
"use strict";

const allRules = {
  'uses-react': require('./lib/rules/uses-react'),
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
      },
    },
  },
}
