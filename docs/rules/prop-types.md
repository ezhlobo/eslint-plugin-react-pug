# Prevent definitions of unused prop types and prevent missing props validation (react-pug/prop-types)

- Prevent props used in components to be incorrectly marked as unused
- Request defined prop types to be used in components

## Rule Details

The following patterns are considered warnings:

```jsx
const Component = props => pug`
  = props.test
`
```

```jsx
const Component = () => pug`
  span Hello
`
Component.propTypes = {
  test: PropTypes.string,
}
```

The following patterns are **not** considered warnings:

```jsx
const Component = props => pug`
  = props.test
`
Component.propTypes = {
  test: PropTypes.string,
}
```

```jsx
const Component = () => pug`
  span Hello
`
```
