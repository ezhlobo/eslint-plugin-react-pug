# Disallow undeclared variables in Pug (react-pug/no-undef)

This rule helps locate potential ReferenceErrors resulting from misspellings or missing components.

## Rule Details

The following patterns are considered warnings:

```jsx
pug`h1= title`
```

```jsx
pug`Hello(name="John")`
```

The following patterns are **not** considered warnings:

```jsx
var title = 'My Title'

pug`h1= title`
```

```jsx
var Hello = require('./Hello')

pug`Hello(name="John")`
```

## When Not To Use It

If you are not using Pug then you can disable this rule.
