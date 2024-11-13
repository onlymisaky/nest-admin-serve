/**
 * @link https://commitlint.js.org/
 * @type {import('commitlint').UserConfig}
 */
module.exports = {
  extends: ['@commitlint/config-angular'],
  ignores: [(commit) => commit.startsWith('init')],
};
