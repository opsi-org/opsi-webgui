module.exports = {
  root: true,
  env: { browser: true, node: true },
  // parserOptions: {
  //   // parser: '@typescript-eslint/parser'
  //   parser: '@babel/eslint-parser',
  //   // parser: 'babel-eslint',
  //   //   sourceType: 'module'
  //   sourceType: 'module'
  // },
  extends: [
    '@nuxtjs',
    '@nuxtjs/eslint-config-typescript',
    'eslint:recommended',
    'plugin:nuxt/recommended',
    'plugin:@intlify/vue-i18n/recommended',
    'plugin:jsonc/recommended-with-jsonc',
    'plugin:vuejs-accessibility/recommended'
  ],
  plugins: [
    'vue',
    'vuejs-accessibility'
  ],
  rules: { },
  settings: {
    'vue-i18n': {
      localeDir: '../uib-components/locale/webgui_*.{json}',
      // localeDir: [
      //   {
      //     pattern: '../uib-components/locale/*.json',
      //     localeKey: 'file'
      //   }
      //   // {
      //   //   pattern: '../locale/*.json',
      //   //   localeKey: 'file'
      //   // },
      // ],
      messageSyntaxVersion: '^8.27.1'
    }
  }
}
