module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  // parserOptions: {
  //   parser: 'babel-eslint',
  //   sourceType: 'module'
  // },
  extends: [
    '@nuxtjs',
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended'
  ],
  // extends: [
  //   '@nuxtjs/eslint-config-typescript',
  //   'plugin:nuxt/recommended'
  // ],
  plugins: [
    // 'vue/attribute-hyphenation': 'off'
    // 'no-unused-vars': 'off',
  ],
  // add your custom rules here
  rules: {}
}
