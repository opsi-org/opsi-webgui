# how to Upgrade nuxt
## layouts`
* `layouts/default.vue`: loaded automatically
* `layouts/custom.vue`
```html
<template>
  <div>
    A different structure for specific pages
    <slot />
  </div>
</template>
```
* `pages/custom.vue`:

```vue
<script setup>
....
definePageMeta({
  layout: "custom",
});
....
</script>
```


## mixins -> composable mixin
* `composables/mixins/useBye.js` (-> not autoimported in comparison to files directly in composables/)
```js
export const useBye = () => {
    return useState('bye', () => 'Bye world')
}
```

### inside component:
```js
import { useBye } from '~/composables/mixins/useBye'
```


## Component methods:
* watch:
```js
const theme = ref(settings.theme)

watch(theme, (newTheme, oldTheme) => {
  settings.changeTheme(newTheme)
});
```

## Vuex
https://nuxt.com/docs/migration/configuration#vuex
Nuxt no longer provides a Vuex integration. Instead, the official Vue recommendation is to use pinia, which has built-in Nuxt support via a Nuxt module. Find out more about pinia here.
### Pinia Store
* installation and neccessary packages
```json
  "devDependencies": {
    "@pinia-plugin-persistedstate/nuxt": "^1.1.2",
    "@pinia/nuxt": "^0.4.11",
    "pinia": "^2.1.6",
    ...
  }
```
* component
```javascript
const counterStore = useCounterStore()
```
* store file
```javascript
export const useCounterStore = defineStore('main', {
  persist: true, // optional
  state: () => ({
    counter: 0,
  }),
  actions: {
    increment() {
      // `this` is the store instance
      this.counter++
    },
  },
})
```
* store file for COOKIES
```javascript

export const useCookieStore = defineStore('main', {
  state: () => {
    return {
      someCookie: 'hello pinia',
    }
  },
  persist: {
    storage: persistedState.cookiesWithOptions({
      sameSite: 'strict', // optional
    }),
  },
})
```


## i18n
* installation and neccessary packages

```json
  "devDependencies": {
    "@nuxtjs/i18n": "^8.0.0-rc.4",
    ...
  }
```
## Bootstrap Vue
### installation and neccessary packages
https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs#installation-nuxt-js-3

```json
  "devDependencies": {
    "@bootstrap-vue-next/nuxt": "^0.14.10",
    "bootstrap": "^5.3.2",
    "bootstrap-vue-next": "^0.14.10",
    ...
  }
```

Add following to nuxt.config.ts
  * `modules:[..., '@bootstrap-vue-next/nuxt']`
  * `css: ['bootstrap/dist/css/bootstrap.min.css']`

### icons are deprecated !!!
https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/icons
---> element plus icons....

## Element Plus
### installation and neccessary packages
https://github.com/element-plus/element-plus-nuxt-starter

```json
// package.json
  "dependencies": {
    "@element-plus/icons-vue": "^2.1.0",
    "element-plus": "^2.4.x",
    ...
  },
  "devDependencies": {
    "@element-plus/nuxt": "^1.0.6",
    // "@nuxtjs/color-mode": "^3.3.0", // used for theming
    "sass": "^1.69.4"
    ...
  }
```
```ts
// nuxt.config.ts
  modules: [
    '@element-plus/nuxt',
    // '@nuxtjs/color-mode',
    ...
  ],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/scss/element/index.scss" as element;`,
        },
      },
    },
  },
  elementPlus: {
    icon: 'ElIcon',
    importStyle: 'scss',
    themes: ['dark'],
  },
```
```
# .npmrc
shamefully-hoist=true
strict-peer-dependencies=false
shell-emulator=true
# fix code ERESOLVE \n ERESOLVE could not resolve
legacy-peer-deps=true
```
### Themes and Styling
* located in assets/scss/...
* currently element-plus uses colors from bootstrap. so they have same variables 'primary',...


<!-- ```js
// nuxt.config.ts

  // colorMode
  colorMode: {
    classSuffix: '',
  },
``` -->
## General topics

### Props
https://vuejs.org/guide/components/props.html#prop-validation
<div style="text-align: left; display: grid; grid-template-columns: 1fr 1fr;">
  <div>vue2

```js
  @Prop({ default: false }) small!: boolean
  @Prop({ default: 'cylon' }) animation!: string
  @Prop({ default: 'black' }) color!: string
```
  </div>
  <div>vue3

```js
const props = defineProps({
  small: { type: Boolean, default: false} ,
  animation: { type: String, default: 'cylon' },
  color: { type: String, default: 'black' },
  // // if an object is passed, default argument has to be a function. example:
  // propE: {
  //   type: Object,
  //   default(rawProps) {
  //     return { message: 'hello' }
  //   }
  // },
})
```
  </div>
</div>

### Computed
https://vuejs.org/guide/components/props.html#prop-validation
<div style="text-align: left; display: grid; grid-template-columns: 1fr 1fr;">
  <div>vue2

```js
  get value () { return 'foo' }
  set value (x) { this.x = x }
```
  </div>
  <div>vue3

```js
const colorMode = computed({
  get: () => 'foo',
  set: (x) => { this.x = x}
});
```
  </div>
</div>

### Paths

<div style="text-align: left; display: grid; grid-template-columns: 1fr 1fr;">
  <div>vue2

```js
  import { icons } from '../../mixins/icons'
```
  </div>
  <div>vue3

```js
import { useIcons } from '~/composables/mixins/useIcons'
```
  </div>
</div>
* we used relative paths like `../mixins/...`
* have to use `~/composables/mixins/...`


# Further topics
## performance
* currently nuxt (vite/nitro) is quiet slowly during startup
* problems seems to be scss and vite preprocessor option
* https://github.com/nuxt/nuxt/issues/22116

# markdown helpers
## columns:
<div style="text-align: left; display: grid; grid-template-columns: 1fr 1fr;">
  <div>vue2

```js
  ..........
```
  </div>
  <div>vue3

```js
  ...........
```
  </div>
</div>