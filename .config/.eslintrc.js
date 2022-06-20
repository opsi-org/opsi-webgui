module.exports = {
  root: true,
  env: { browser: true, node: true },
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  extends: [
    '@nuxtjs',
    '@nuxtjs/eslint-config-typescript',
    'eslint:recommended',
    'plugin:nuxt/recommended',
    'plugin:@intlify/vue-i18n/recommended',
    'plugin:jsonc/recommended-with-json',
    "plugin:vuejs-accessibility/recommended"
  ],
  plugins: [
    "vue",
    "vuejs-accessibility"
  ],
  overrides: [
    { files: ["*.json", "*.jsonc", "*.json5"], extends: ["plugin:@intlify/vue-i18n/recommended"] },
    { files: ['*.ts', '*.vue'],
      // extends: [ 'plugin:@typescript-eslint/recommended-requiring-type-checking'],
      extends: [ 'plugin:@typescript-eslint/recommended'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser'
      },
      rules: {
        // maybe enable later:
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/ban-types': 'off'
      }
    }
  ],
  ignorePatterns: ['../config/', '../tsconfig.json', '../package.json'],
  // add your custom rules here
  rules: {
    //vuejs-accessibility:
    // 'vuejs-accessibility/mouse-events-have-key-events':'error'

    //i18n:
    // '@intlify/vue-i18n/no-unknown-locale': 'error',
    // '@intlify/vue-i18n/no-raw-text': ['error', {
    //     'attributes': {
    //       '/.+/': ['title', 'aria-label', 'aria-placeholder', 'aria-roledescription', 'aria-valuetext', 'label', 'text', 'placeholder', 'loading-text'],
    //       'input': ['placeholder'],
    //       'img': ['alt']
    //     },
    //     'ignoreNodes': ['md-icon', 'v-icon'],
    //     'ignorePattern': '',
    //     // 'ignorePattern': '^[-#:()&]+$',
    //     'ignoreText': ['EUR', 'HKD', 'USD', '*', '≠', ' ≠ ', '/', '-', ':', ': ', '[', ']']
    //   }
    // ],
    // '@intlify/vue-i18n/no-unused-keys': ['error', { src: './../../', extensions: ['.ts', '.js', '.vue'] }],
    // '@intlify/vue-i18n/no-missing-keys': 'error',
    // // '@intlify/vue-i18n/no-missing-keys-in-other-locales': ['error'],
    // // '@intlify/vue-i18n/no-duplicate-keys-in-locale': 'error',
    // // '@intlify/vue-i18n/no-missing-keys-in-other-locales': 'error',
    // 'jsonc/vue-custom-block/no-parsing-error': 'error'
  },
  settings: {
    'vue-i18n': {
      localeDir: {
        pattern: '../../locale/*.{jsonc|json}',
        localeKey: 'key'
      },
      messageSyntaxVersion: '^8.27.1'
    }
  }
}
