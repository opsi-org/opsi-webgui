const vueParser = require('vue-eslint-parser')
const tsParser = require('@typescript-eslint/parser')
const vuePlugin = require('eslint-plugin-vue')
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const a11yPlugin = require('eslint-plugin-vuejs-accessibility')

const a11yErrorRules = Object.fromEntries(Object.keys(a11yPlugin.configs.recommended?.rules || {}).map((rule) => [rule, 'error']))

module.exports = [
  {
    ignores: ['.output/**', '.nuxt/**', 'node_modules/**', 'dist/**', 'coverage/**'],
  },
  // Wires `vue/comment-directive` + the Vue SFC processor so inline
  // `<!-- eslint-disable-next-line ... -->` comments work inside <template>.
  ...vuePlugin.configs['flat/base'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      ecmaVersion: 2021,
    },
    plugins: {
      vue: vuePlugin,
      '@typescript-eslint': tsPlugin,
      'vuejs-accessibility': a11yPlugin,
    },
    rules: {
      ...a11yErrorRules,
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'padding-line-between-statements': ['error', { blankLine: 'always', prev: 'function', next: 'function' }],
    },
  },
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...(tsPlugin.configs.recommended?.rules || {}),
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'padding-line-between-statements': ['error', { blankLine: 'always', prev: 'function', next: 'function' }],
    },
  },
]
