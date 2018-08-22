# Prevent React to be marked as unused (react-pug/uses-react)

Prevent React to be incorrectly marked as unused.

## Rule Details

The following patterns are considered warnings:

```jsx
var React = require('react')

// nothing to do with React
```

The following patterns are **not** considered warnings:

```jsx
var React = require('react')

var Hello = pug`h1 Hello`
```

## When Not To Use It

If you are not using pug, if React is declared as global variable or if you do not use the no-unused-vars rule then you can disable this rule.
