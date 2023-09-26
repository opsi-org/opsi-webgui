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

## General topics
### paths
* we used relative paths like `../mixins/...`
* have to use `~/composables/mixins/...`