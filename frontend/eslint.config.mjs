import withNuxt from './.nuxt/eslint.config.mjs'
import vueI18n from '@intlify/eslint-plugin-vue-i18n'

export default withNuxt({
  ...vueI18n.configs['flat/recommended'],
  files: ['**/*.vue', '**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'],
  rules: {
    'vue/html-self-closing': 'off',
    '@intlify/vue-i18n/no-missing-keys': ['error'],
    'no-console': ['error', { allow: ['warn', 'error'] }],
  },

  settings: {
    'vue-i18n': {
      localeDir: './i18n/locales/*.json',
      //messageSyntaxVersion: '^9.0.0',
    },
  },
})
