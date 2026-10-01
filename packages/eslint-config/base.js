/** ESLint flat config for pure TypeScript packages (no React Native). */
const { defineConfig } = require('eslint/config');
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-config-prettier/flat');
const globals = require('globals');
const { sharedIgnores, sharedRules } = require('./shared');

module.exports = defineConfig([
  sharedIgnores,
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ['**/*.{js,cjs}'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  sharedRules,
  prettier,
]);
