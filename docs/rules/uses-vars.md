# Prevent variables used in Pug to be marked as unused (react-pug/uses-vars)

Prevent variables used in pugjs to be incorrectly marked as unused

## Rule Details

The following patterns are considered warnings:

```jsx
var Hello = require('./Hello')
```

The following patterns are **not** considered warnings:

```jsx
var Hello = require('./Hello')

pug`Hello(name="John")`
```

## When Not To Use It

If you are not using pug or if you do not use the no-unused-vars rule then you can disable this rule.
