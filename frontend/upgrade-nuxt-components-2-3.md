# how to Upgrade nuxt parts

## Paths
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

* in the past we used relative paths like `../mixins/...`
* can use `~` directly now: `~/composables/mixins/...`


## layouts
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
    definePageMeta({ layout: "custom" });
    </script>
    ```

## Mixins and Composables
Mixins do not exists in vue3 anymore. So we need to change them to composables. Files located directly under `composables/` will be autoimported. Other files located in subdirectories like `composables/subdir/...` need to be imported manually (like our mixins)

* `composables/mixins/useCounter.js`
  ```js
  export const useCounter = () => {
    const count = ref(0);

    function increment() {
      count.value++;
    }

    function decrement() {
      count.value--;
    }

    return { count, increment, decrement };
  }
  ```

* inside component:
  ```js
  import { useCounter } from '~/composables/mixins/useCounter'
  const counterMixin = useIcons()
  // counterMixin.increment()
  ```


## Component methods:

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

### watch:
```js
const theme = ref(settings.theme) // settings.theme is here just the initial value

watch(theme, (newTheme, oldTheme) => {
  settings.changeTheme(newTheme)
});
```


### Computed
https://vuejs.org/guide/components/props.html#prop-validation
<div style="text-align: left; display: grid; grid-template-columns: 1fr 1fr;">
  <div>vue2

```js
  get colorMode () { return 'foo' }
  set colorMode (x) { this.x = x }
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

### axios / fetch
* can use nuxt native method useFetch
* it needs to be overwritten, if we want to use different baseURL (`useApiFetch` composable)
* usage in components:
  ```vue
  <template>
    <p v-if="fetchResult.pending">Fetching...</p>
    <pre v-else-if="fetchResult.error">Could not load data: {{ error.data }}</pre>
    <div v-else>
      Result: {{ fetchResult.value.result }} <br />
    </div>
  </template>

  <script setup>
  const fetchResult = ref({});
  onMounted( async () => {
    const { data: result } = await $fetch('/user/opsiserver').get().json()
    // for fetching urls other then /addons/webgui/api use:
    const { data: result, error, pending } = await useApiFetch('/other-path', {
      method: "GET"
    }, '/another-prefix').json()
    // this will be combined to: localhost:4447/another-prefix/other-path in development mode

    fetchResult.value = result;
  });
  </script>
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
## $mq
* nuxt-mq is deprecated (https://www.npmjs.com/package/nuxt-mq)
* recommandation: `useMediaQuery` https://vueuse.org/core/useMediaQuery/ (already imported, and composable already created)
* inside component it looks like:
  ```vue
  <template>
      screen: {{  mq.$mq }}
  </template>

  <script setup>
  const mq = useMQ()
  </script>
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

### icons are deprecated in bootstrap next
 // https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/icons
Options:
* element plus icons.... (small collection)
* recommendation: unplugin (large collection, including all bootstrap icons)
* https://icon-sets.iconify.design/ (used by unplugin-icons, only needs one npm library, to be able to use a lot of libraries)


We will use: iconify same as before just other iconnames (cause bigger collection)
* One difference: animations can be done directly by icon/name  instead of 'animation' property (See https://icon-sets.iconify.design/?query=loading)
* TODO: Maybe good to restrict to one or two iconlibraries inside iconify

`npm i -D @iconify/vue`
## Element Plus
### installation and neccessary packages
https://github.com/element-plus/element-plus-nuxt-starter
* `package.json`
  ```json
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
* `nuxt.config.ts`
  ```ts
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
      importStyle: 'scss',
      themes: ['dark'],
    },
  ```
* `.npmrc`
  ```
  shamefully-hoist=true
  strict-peer-dependencies=false
  shell-emulator=true
  # fix code ERESOLVE \n ERESOLVE could not resolve
  legacy-peer-deps=true
  ```

### Themes and Styling
* located in assets/scss/...
* currently element-plus uses colors from bootstrap. so they have same variables 'primary',...


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