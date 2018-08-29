# Enforce consistent indentation (react-pug/indent)

This helps to be consistent with using indentation across the codebase.

Basically it requires 2 spaces always.

## Rule Details

The following patterns are considered warnings:

```jsx
pug`
 div
`
```

```jsx
pug`
  div
     div
`
```

The following patterns are **not** considered warnings:

```jsx
pug`div= 'Hello'`
```

```jsx
pug`
  div
    div
`
```

## When Not To Use It

If you are not using Pug then you can disable this rule.
