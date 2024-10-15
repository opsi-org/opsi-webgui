// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  { // https://github.com/nuxt/eslint/discussions/413
    ignores: [
    "node_modules/",
    "dist/*",
    "./package-dry.json",
    "./package.json",
    "package.json",
    "./locale/*.json",
    ".vscode/*.json",
    "**/*/tsconfig.json",
    "vuex-persist.js",
    "tests/",
    "pages/*.test.unit.js"
  ],
  },
  {
  // Your custom configs here
  // https://eslint.nuxt.com/packages/module
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "vue/attributes-order": "off",

    // TODO: Fix the problems if following rules are enabled
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-unused-expressions": "off",
    // "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unsafe-function-type": "off",
    "@typescript-eslint/no-wrapper-object-types": "off",
    "@typescript-eslint/no-empty-object-type": "off",
    "@typescript-eslint/no-dynamic-delete": "off",
    // "@typescript-eslint/ban-ts-comment": "off",
    // "@typescript-eslint/consistent-type-imports": "off",

    // "vue/no-unused-vars": "off",
    // "vue/no-dupe-keys": "off",
    // "vue/no-mutating-props": "off",
    // "vue/no-deprecated-v-bind-sync": "off",
    "vue/no-template-shadow": "off", // warning
    // "vue/no-side-effects-in-computed-properties": "off",
    // "vue/no-ref-as-operand": "off",
    // "vue/no-multiple-template-root": "off",
    // "vue/valid-template-root": "off",
    // "vue/no-use-v-if-with-v-for": "off",
    // "vue/no-dupe-v-else-if": "off",
    // "vue/valid-v-for": "off",
    // "vue/valid-v-else": "off",
    // "vue/require-valid-default-prop": "off",
    // "vue/require-v-for-key": "off",
    // "vue/require-default-prop": "off",
    // "vue/attribute-hyphenation": "off",
    // "vue/first-attribute-linebreak": "off",
    // "vue/v-slot-style": "off",
    // "vue/html-self-closing": "off",

    // "import/first": "off",
    // "import/no-duplicates": "off",
    // "no-unused-vars": "off",
    // "no-undef": "off",
    // "no-empty": "off",
    // "no-var": "off",
    // "no-extra-boolean-cast": "off",
    // "no-prototype-builtins": "off",

    "no-console": ["error", {
        "allow": [
            "warn",
            "error"
        ]
    }],
    // "no-console": "on",
    // "no-restricted-syntax": [
    //   "error",
    //   {
    //       "selector": "CallExpression[callee.object.name='console'][callee.property.name!=/^(log|warn|error|info|trace)$/]",
    //       "message": "Unexpected property on console object was called"
    //   }
    // ]
  },
})
