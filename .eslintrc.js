module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "jest": true
    },
    // extends: [
    //     '@nuxtjs',
    //     '@nuxtjs/eslint-config-typescript',
    //     'plugin:nuxt/recommended'
    // ],
    "extends": [
        "eslint:recommended",
        'plugin:nuxt/recommended',
        "plugin:@typescript-eslint/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    // "parserOptions": {
    //     "ecmaVersion": 13,
    //     "sourceType": "module"
    // },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        '@typescript-eslint/no-var-requires': 0
    }
};
