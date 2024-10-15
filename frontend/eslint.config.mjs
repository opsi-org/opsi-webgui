// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  // Your custom configs here
  // https://eslint.nuxt.com/packages/module
  rules: { // TODO: Fix the problems if following rules are enabled
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unsafe-function-type": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-wrapper-object-types": "off",
    "@typescript-eslint/no-empty-object-type": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/consistent-type-imports": "off",
    "@typescript-eslint/no-unused-expressions": "off",
    "@typescript-eslint/no-dynamic-delete": "off",

    "vue/no-unused-vars": "off",
    "vue/no-use-v-if-with-v-for": "off",
    "vue/no-dupe-keys": "off",
    "vue/valid-template-root": "off",
    "vue/require-valid-default-prop": "off",
    "vue/no-mutating-props": "off",
    "vue/attribute-hyphenation": "off",
    "vue/valid-v-for": "off",
    "vue/no-deprecated-v-bind-sync": "off",
    "vue/no-template-shadow": "off",
    "vue/require-v-for-key": "off",
    "vue/no-side-effects-in-computed-properties": "off",
    "vue/valid-v-else": "off",
    "vue/no-ref-as-operand": "off",
    "vue/v-slot-style": "off",
    "vue/attributes-order": "off",
    "vue/html-self-closing": "off",
    "vue/first-attribute-linebreak": "off",
    "vue/no-multiple-template-root": "off",
    "vue/no-dupe-v-else-if": "off",
    "vue/require-default-prop": "off",

    "import/first": "off",
    "import/no-duplicates": "off",
    "no-unused-vars": "off",
    "no-undef": "off",
    "no-empty": "off",
    "no-var": "off",
    "no-extra-boolean-cast": "off",
    "no-prototype-builtins": "off",
    "prefer-const": "off",
  },
})
