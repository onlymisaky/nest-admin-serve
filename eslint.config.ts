/** @link https://github.com/antfu/eslint-config */

import antfu from '@antfu/eslint-config';

console.log('eslint.config.ts');

const eslintConfig = antfu({
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

export default eslintConfig;
