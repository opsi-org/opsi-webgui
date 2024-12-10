// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import vueI18n from '@intlify/eslint-plugin-vue-i18n'

export default withNuxt(
  ...vueI18n.configs['flat/recommended'],
  {
    // https://github.com/nuxt/eslint/discussions/413
    ignores: [
      'node_modules/',
      'dist/*',
      './package-dry.json',
      './package.json',
      'package.json',
      './locale/*.json',
      '.vscode/*.json',
      '**/*/tsconfig.json',
      'vuex-persist.js',
      'tests/',
      'pages/*.test.unit.js',
    ],
  },
  {
    // Your custom configs here
    // https://eslint.nuxt.com/packages/module
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/attributes-order': 'off',
      'vue/html-self-closing': 'off',

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
