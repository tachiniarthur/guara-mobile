/** ESLint flat config for Expo / React Native apps. */
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier/flat');
const globals = require('globals');
const { sharedIgnores, sharedRules } = require('./shared');

module.exports = defineConfig([
  sharedIgnores,
  expoConfig,
  {
    // Tooling configs (babel, metro, tailwind, jest…) run in Node.
    files: ['*.config.{js,cjs,mjs}', '**/*.config.{js,cjs,mjs}'],
    languageOptions: { globals: globals.node },
  },
  sharedRules,
  prettier,
]);
