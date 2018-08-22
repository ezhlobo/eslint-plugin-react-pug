# Disallow JavaScript interpolation (react-pug/no-interpolation)

It asks to use Pug with own well-handled interpolation than just using JavaScript interpolation.

## Rule Details

The following patterns are considered warnings:

```jsx
const test = 'Hello'

pug`
  div ${test}
`
```

```jsx
const test = 'Hello'

pug`
  Component(attr=${test})
`
```

The following patterns are **not** considered warnings:

```jsx
const test = 'Hello'

pug`
  div #{test}
`
```

```jsx
const test = 'Hello'

pug`
  Component(attr=test)
`
```

## When Not To Use It

If you are not using Pug then you can disable this rule.
