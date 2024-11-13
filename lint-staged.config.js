/**
 * @link https://github.com/okonet/lint-staged
 * @type {import('lint-staged').Config}
 */
module.exports = {
  '**/*.{ts}': ['npm run eslint'],
};
