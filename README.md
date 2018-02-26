# eslint-plugin-react-pug [![circleci](https://circleci.com/gh/ezhlobo/eslint-plugin-react-pug/tree/master.svg)](https://circleci.com/gh/ezhlobo/eslint-plugin-react-pug/tree/master)

[![Greenkeeper badge](https://badges.greenkeeper.io/ezhlobo/eslint-plugin-react-pug.svg)](https://greenkeeper.io/)

Add supporting of pugjs with react.

It adds supporting of [babel-plugin-transform-react-pug](https://github.com/pugjs/babel-plugin-transform-react-pug).

## Table of Contents

* [Installation](#installation)
* [Usage](#usage)
* [Supported Rules](#supported-rules)
  * [`react-pug/no-undef`](#react-pugno-undef)
  * [`react-pug/uses-react`](#react-puguses-react)
  * [`react-pug/uses-vars`](#react-puguses-vars)

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

## Supported Rules

### `react-pug/no-undef`

Disallow undeclared variables in Pug

#### Rule details

The following patterns are considered warnings:
```js
pug`Hello(name="John")`
```

The following patterns are not considered warnings:
```js
var Hello = require('./Hello')

pug`Hello(name="John")`
```

#### When Not To Use It

If you are not using Pug then you can disable this rule.

### `react-pug/uses-react`

Prevent React to be incorrectly marked as unused

#### Rule Details

The following patterns are considered warnings:
```js
var React = require('react')

// nothing to do with React
```

The following patterns are not considered warnings:
```js
var React = require('react')

var Hello = pug`h1 Hello`
```

#### When Not To Use It

If you are not using pug, if React is declared as global variable or if you do not use the no-unused-vars rule then you can disable this rule.

### `react-pug/uses-vars`

Prevent variables used in pugjs to be incorrectly marked as unused

#### Rule Details

The following patterns are considered warnings:
```js
var Hello = require('./Hello')
```

The following patterns are not considered warnings:
```js
var Hello = require('./Hello')

pug`Hello(name="John")`
```

#### When Not To Use It

If you are not using pug or if you do not use the no-unused-vars rule then you can disable this rule.
