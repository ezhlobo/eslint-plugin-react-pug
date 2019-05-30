# Lint JavaScript code inside Pug (react-pug/eslint)

This rule applies eslint to JavaScript code used in Pug.

## Rule Details

The following patterns are considered warnings:

```jsx
/*eslint react-pug/eslint: ["error", { "comma-spacing": "error" }]*/
pug`div(data-value=getValueFor(one,two,three))`
```

```jsx
/*eslint react-pug/eslint: ["error", { "no-multi-spaces": "error" }]*/
pug`div(data-value=getValueFor(one,two,three,  four,   five))`
```

The following patterns are **not** considered warnings:

```jsx
/*eslint react-pug/eslint: ["error", { "comma-spacing": "error" }]*/
pug`div(data-value=getValueFor(one, two, three))`
```

```jsx
/*eslint react-pug/eslint: ["error", { "no-multi-spaces": "error" }]*/
pug`div(data-value=getValueFor(one,two,three, four, five))`
```

## When Not To Use It

If you don't won't to apply eslint rules to the javascript inside Pug.
