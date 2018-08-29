# Manage empty lines in Pug (react-pug/empty-lines)

It creates rules for managing empty lines:

* Require empty line in the beginning
* Require empty line in the end
* Require empty line before we go out from nesting
* Require empty line between siblings (if there are more than 2 siblings)
* Prohibit more than 1 empty line

## Rule Details

The following patterns are considered warnings:

```jsx
pug`
  div Hello`
```

```jsx
pug`
  div One
  div Two
  div Three
`
```

```jsx
pug`
  div
    div Nested
  div Outside
`
```

The following patterns are **not** considered warnings:

```jsx
pug`div Hello`
```

```jsx
pug`
  div Hello
`
```

```jsx
pug`
  div One

  div Two

  div Three
`
```

```jsx
pug`
  div
    div Nested

  div Outside
`
```

## When Not To Use It

If you don't want to have consistency in empty lines.
