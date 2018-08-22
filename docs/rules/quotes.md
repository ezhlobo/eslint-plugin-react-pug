# Manage quotes in Pug (react-pug/quotes)

This helps to be consistent with using quotes across the codebase.

Basically it requires double quotes for basic strings, and single quotes for javascript.

## Rule Details

The following patterns are considered warnings:

```jsx
pug`div= "Hello"`
```

```jsx
pug`div(data-text='Hello')`
```

The following patterns are **not** considered warnings:

```jsx
pug`div= 'Hello'`
```

```jsx
pug`div(data-text="Hello")`
```

## When Not To Use It

If you are not using Pug then you can disable this rule.
