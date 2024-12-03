// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
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
  },
)
