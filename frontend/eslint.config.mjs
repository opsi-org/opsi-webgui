// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

// @ts-ignore
import vueI18n from '@intlify/eslint-plugin-vue-i18n'
// import header from 'eslint-plugin-header'
// header.rules.header.meta.schema = false

export default withNuxt(
  ...vueI18n.configs['flat/recommended'],
  {
    // https://github.com/nuxt/eslint/discussions/413
    ignores: [
      'node_modules/*',
      'dist/*',
      '.nuxt/*',
      'output/*',
      'webgui/*',
      'webgui-dev/*',
      'package.json',
      'package.json',
      // 'locale/*.json',
      '.vscode/*.json',
      '**/*/tsconfig.json',
      'vuex-persist.js',
      'tests/',
      '**/*.test.unit.js',
    ],
  },
  {
    // plugins: ['eslint-plugin-header'],
    // plugins: { header },
    // Your custom configs here
    // https://eslint.nuxt.com/packages/module
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/attributes-order': 'off',
      'vue/html-self-closing': 'off',
      '@intlify/vue-i18n/no-missing-keys': ['error'],
      // console error and warn are allowed
      'no-console': [
        'error',
        {
          allow: ['warn', 'error'],
        },
      ],
    },
    settings: {
      'vue-i18n': {
        localeDir: './locale/*.json',
        // Specify the version of `vue-i18n` you are using.
        // If not specified, the message will be parsed twice.
        messageSyntaxVersion: '^9.0.0',
      },
    },
  },
)
