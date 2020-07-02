// https://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  rules: {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow variables like >> user_id
    'camelcase': 0,
    'no-trailing-spaces': [
      'error', {'skipBlankLines': true}
    ],
    'quotes': [0, "double"],
    'semi': 0,
    'indent': 0,
    'comma-dangle': 0,
    'func-call-spacing': 0,
    'space-in-parens': 0,
    'spaced-comment': 0,
    'space-before-function-paren': 0,
    'padded-blocks': 0,
    'eqeqeq': 0,
    'no-multiple-empty-lines': 0,
    'eol-last': 0,

    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
