// @ts-check

import withNuxt from './.nuxt/eslint.config.mjs'
// @ts-ignore
import vueI18n from '@intlify/eslint-plugin-vue-i18n'

export default withNuxt(
  ...vueI18n.configs['flat/recommended'],
  {
    ignores: [
      'node_modules/*',
      'dist/*',
      '.nuxt/*',
      'output/*',
      'webgui/*',
      'webgui-dev/*',
      'package.json',
      '.vscode/*.json',
      '**/*/tsconfig.json',
      'vuex-persist.js',
      'tests/',
      '**/*.test.unit.js',
    ],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/attributes-order': 'off',
      'vue/html-self-closing': 'off',
      '@intlify/vue-i18n/no-missing-keys': ['error'],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
    settings: {
      'vue-i18n': {
        localeDir: './locale/*.json',
        messageSyntaxVersion: '^9.0.0',
      },
    },
  }
)
