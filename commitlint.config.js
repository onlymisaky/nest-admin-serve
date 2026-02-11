/**
 * @link https://commitlint.js.org/#/reference-configuration
 * @type {import('@commitlint/types').UserConfig}
 */
const commitlintConfig = {
  extends: ['@commitlint/config-angular'],
  ignores: [(commit) => commit.startsWith('init')],
};

export default commitlintConfig;
