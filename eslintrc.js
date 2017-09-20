module.exports = {
  extends: [
    'airbnb-base',
  ],
  env: {
    mocha: true,
  },
  rules: {
    'no-multiple-empty-lines': [
      'error', {
        max: 1,
        maxBOF: 0,
        maxEOF: 0,
      },
    ],
    'no-undef': 'error',
    'padded-blocks': ['error', {
      blocks: 'never',
      classes: 'never',
      switches: 'never',
    }],
    semi: ['error', 'never'],

    'object-shorthand': 'off',
    'func-names': 'off',
  },
}
