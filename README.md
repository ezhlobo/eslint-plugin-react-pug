# eslint-plugin-react-pug

Add supporting of pugjs with react.

[![npm version](https://img.shields.io/npm/v/eslint-plugin-react-pug.svg?longCache)](https://www.npmjs.com/package/eslint-plugin-react-pug) [![CI Status](https://img.shields.io/circleci/project/github/ezhlobo/eslint-plugin-react-pug/master.svg?longCache)](https://circleci.com/gh/ezhlobo/eslint-plugin-react-pug/tree/master)

It adds supporting of [babel-plugin-transform-react-pug](https://github.com/pugjs/babel-plugin-transform-react-pug).

## Table of Contents

* [Installation](#installation)
* [Usage](#usage)
* [List of supported rules](#list-of-supported-rules)

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-react-pug`:

```
$ npm install eslint-plugin-react-pug --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-react-pug` globally.

## Usage

Add `react-pug` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "react-pug"
    ]
}
```

Then configure the rules you want to use under the rules section.

```json
{
    "extends": [
        "plugin:react-pug/all"
    ]
}
```

## List of supported rules

* [`react-pug/empty-lines`](./docs/rules/empty-lines.md): Manage empty lines in Pug
* [`react-pug/indent`](./docs/rules/indent.md): Enforce consistent indentation
* [`react-pug/no-broken-template`](./docs/rules/no-broken-template.md): Disallow broken template
* [`react-pug/no-interpolation`](./docs/rules/no-interpolation.md): Disallow JavaScript interpolation
* [`react-pug/no-undef`](./docs/rules/no-undef.md): Disallow undeclared variables in Pug
* [`react-pug/quotes`](./docs/rules/quotes.md): Manage quotes in Pug
* [`react-pug/uses-react`](./docs/rules/uses-react.md): Prevent React to be marked as unused
* [`react-pug/uses-vars`](./docs/rules/uses-vars.md): Prevent variables used in Pug to be marked as unused
