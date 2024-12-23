const { antfu } = require('@antfu/eslint-config');

/** @link https://github.com/antfu/eslint-config */
/** @type {import('eslint').Linter.Config[]} */
module.exports = antfu({
  typescript: true,
  settings: {
    // 'import/resolver': {
    //   typescript: {
    //     project: './tsconfig.json',
    //   },
    // },
  },
  rules: {
    'style/arrow-parens': 'off',
    'style/semi': ['error', 'always'],
    'style/quote-props': 'off',
    'node/prefer-global/process': 'off',
    'test/prefer-lowercase-title': 'off',
    'ts/consistent-type-imports': 'off',
  },
  ignores: [
    '**/tsconfig.*.json',
    '**/tsconfig.json',
  ],
});
