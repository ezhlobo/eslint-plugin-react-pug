# Inherit pug-lint to validate pug (experimental)

This rule applies pug-lint to pug templates in js.

[See pug-lint project](https://github.com/pugjs/pug-lint)

## Rule Details

The following patterns are considered warnings:

```jsx
/*eslint react-pug/pug-lint: ["error", { "requireSpaceAfterCodeOperator": true }]*/
pug`div=greeting`
```

```jsx
/*eslint react-pug/pug-lint: ["error", { "disallowTrailingSpaces": true }]*/
pug`div: img() `
```

The following patterns are **not** considered warnings:

```jsx
/*eslint react-pug/pug-lint: ["error", { "requireSpaceAfterCodeOperator": true }]*/
pug`div= greeting`
```

```jsx
/*eslint react-pug/pug-lint: ["error", { "disallowTrailingSpaces": true }]*/
pug`div: img()`
```
