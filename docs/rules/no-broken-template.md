# Disallow broken template (react-pug/no-broken-template)

It points to places where Pug template is incorrect.

## Rule Details

The following patterns are considered warnings:

```jsx
pug`
  each i in 1, 2, 3]
`
```

```jsx
pug`
  Component(
    iam-object={ a: 1, b: 2
  )
`
```

The following patterns are **not** considered warnings:

```jsx
pug`p= variable`
```

```jsx
pug`
  Component(
    object={a: 1, b: 2}
  )
`
```

## When Not To Use It

If you are not using Pug then you can disable this rule.
