// https://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  env: {
    node: true
  },
  plugins: ["@babel"],
  extends: ["plugin:vue/essential", "@vue/standard"],
  rules: {
    // allow paren-less arrow functions
    "arrow-parens": 0,
    // allow async-await
    "generator-star-spacing": 0,
    "no-extend-native": 0,
    "dot-notation": 0,
    "no-useless-catch": 0,
    "template-tag-spacing": 0,
    "no-mixed-spaces-and-tabs": 0,
    "no-unneeded-ternary": 0,
    "no-unused-expressions": 0,
    "prefer-const": 0,
    "key-spacing": 0,
    "no-return-assign": 0,
    "no-mixed-operators": 0,
    "no-tabs": 0,
    "space-before-blocks": 0,
    // allow variables like >> user_id
    camelcase: 0,
    "no-trailing-spaces": 0,
    quotes: [0, "double"],
    semi: 0,
    indent: 0,
    "comma-dangle": 0,
    "func-call-spacing": 0,
    "space-in-parens": 0,
    "spaced-comment": 0,
    "space-before-function-paren": 0,
    "padded-blocks": 0,
    eqeqeq: 0,
    "no-multiple-empty-lines": 0,
    "eol-last": 0,
    "vue/no-unused-vars": 0,
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off"
  },
  parserOptions: {
    parser: "@babel/eslint-parser"
  }
};
