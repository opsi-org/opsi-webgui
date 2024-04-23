# TODO (order more or less important, because of dependencies)
- [ ] TODO ! test building process...
- [x] packages:
  - [x] i18n
  - [x] store
  - [x] componentslib + icons
  - [x] cookies / localstorage
  - [x] axios/requests
  - [x] msgpack
  - [x] xterm // adminTerminal
  - [x] playwright
  - [x] storybook
- [x] layout
- [x] mixins
- [-] utils
- [x] store
- [ ] components
  - [ ] WIP *general vue3*
    - [ ] messagebus - event:log_updated
  - [-] use elementplus everywhere
- [ ] WIP *pages*
  - [-] Topbar
    - [x] Breadcrumb
    - [x] Logout
  - [x] Sidemenu
  - [-] Quick Panel
    - [x] Quick Selections: All Selections, Depots, Client Groups, Product Groups
    - [ ] Quick Actions: Product Quick Actions, On Demand
    - [-] Settings: Multiselection, Quick Save
    - [x] GUI Settings: Language, Theme
  - [x] Login page
  - [ ] index page
  - [x] Depots
  - [-] WIP Depots-config
  - [-] Clients
  - [-] Clients Clone
  - [-] WIP Clients Config
  - [x] WIP Clients Creation
  - [x] Clients Log
  - [x] Clients Products
  - [-] products
  - [-] WIP products-config
  - [x] Groups: Client and Product Group Actions
  - [-] Admin: General and Maintenance
  - [x] admin-modules
  - [x] admin-terminal
  - [x] admin-healthcheck
  - [x] support
- [-] themes
- [-] stories and screenshot tests


# important links:
* https://learnvue.co/LearnVue-Vue-3-Cheatsheet.pdf
* https://vuejs.org/guide/components/props.html#props-declaration
* https://blog.vuejs.org/posts/vue-3-3#generic-components
* https://element-plus.org/en-US/
* https://element-plus-interactive-docs.netlify.app/story/src-components-data-collapse-collapse-story-vue?variantId=src-components-data-collapse-collapse-story-vue-0
* https://tailwindcss.com/docs/
* https://icon-sets.iconify.design/
* https://localhost:8888/addons/webgui/app/_tailwind/

# how to Upgrade nuxt parts

## Interfaces / Types
* located at `types/`
* import using: `import type { ITableHeaders, ITableData } from '@/types/ttable'`

## Paths
<div style="text-align: left; display: grid; grid-template-columns: 1fr 1fr;">
  <div>vue2

```js
  import { icons } from '../../mixins/icons'
```
  </div>
  <div>vue3
(works only if `lang='js'`)
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

    return { increment, decrement }; // export only if accessed
  }
  ```

* inside component:
  ```js
  import { useCounter } from '~/composables/mixins/useCounter'
  const counterMixin = useIcons()
  // counterMixin.increment()
  ```


## Component methods:
* as before:
```js
onMounted( async () => {
  ....
})
```

### Props / Emits
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
  headerData: { type: Object as PropType<ITableHeader>, default: () => { /* default */ }},
  // // if an object is passed, default argument has to be a function. example:
  // propE: {
  //   type: Object,
  //   default(rawProps) {
  //     return { message: 'hello' }
  //   }
  // },
})
// access:
console.log(props.small)
// or
console.log($attrs.class)
// difference? maybe if class is not defined in 'defineProps'. Todo: check
```
  </div>
</div>

```vue
<script setup>
defineProps(['modelValue'])
defineEmits(['update:modelValue'])
</script>

<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>
```

### watch:
* simple ref watching
```js
// const settings = storeSettings()
const theme = ref(settings.theme) // settings.theme is here just the initial value

watch(theme, (newTheme, oldTheme) => {
  settings.changeTheme(newTheme)
});
```
* prop watching
```ts

const props = defineProps({
  sortBy: { type: String, default: ''},
  // ....
})

watch(() => props.sortBy, () => { .... })
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
    <pre v-if="fetchError">Could not load data</pre>
    <div v-else-if="fetchResult === undefined"> loading.. </div>
    <div v-else>
      Result: {{ fetchResult }} <br />
    </div>
  </template>

  <script setup>
  import { useNotification } from '~/composables/mixins/useComponent';
  const fetchResult = ref(undefined);
  const fetchError = ref(false);
  const $t = useI18n().t
  onMounted( async () => {
    // usually this is enough:
    const { data, error } = await useApiGet('/user/opsiserver')

    // for fetching urls other then /addons/webgui/api use:
    const { data, error } = await useApiGet(
      '/other-path', // url
      '/another-prefix' // prePath
    )
    // this will be combined to: localhost:4447/another-prefix/other-path in development mode

    // show error / data
    if (error) {
      useNotification($t).error(error) // $t only used for translations in error messages (at least currently)
      fetchError.value = error;
      return
    }
    fetchResult.value = data;


    // General ApiMethod params:
    //GET: (required:) url, (optional:) prePath, opts
    //POST: (required:) url, (optional:) body, prePath, opts
    //PUT, DELETE,...  TODO: add to useApiFetch

    // Types of params:
    //    url: string,
    //    body:any=undefined,
    //    prePath: string|undefined = undefined,
    //    opts: UseFetchOptions<any> = {}

    // examples:
    const { data, error } = await useApiGet('/user/opsiserver') // /addons/webgui/api/user/opsiserver
    const { data, error } = await useApiGet('/get-file', '/filetransfer') // /filetransfer/get-file

    const { data, error } = await useApiPOST('/auth/login')
    const { data, error } = await useApiPOST('/auth/login', User)
    const { data, error } = await useApiPOST('/upload', file, '/filetransfer')
  });
  </script>
  ```



### images
* images are now located in public folder
* Todo: clean up
* accessable by `<img src="/images/...">`

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
// use `storeToRefs(...)` if reactivity is needed (usually)
const { counter } = storeToRefs(counterStore)
```

* store file with `setup` syntax

NOTE: This seems to be broken if want to persist state... Better use options syntax

```typescript
// with setup syntax
import { useCookie } from 'nuxt/app'
import { defineStore } from 'pinia'
import { computed } from 'vue'
const expirySec = 60 * 30 // Default=30min

export const storeAuth = defineStore('auth', () => {
  // need to return the states / getters/ actions in the end of the setup

  // states (here used as local vars)
  const myusername: string = localStorage.getItem('username') as string
  const sessionexpiry: Number = expirySec // sec
  const sessionendTime: string = ''

  // getter
  const sessionEndTime = computed(() => sessionendTime)
  const sessionExpiry = computed(() => { return sessionexpiry })
  ...

  // actions
  function login (username: string) {
    this.myusername = username
    localStorage.setItem('username', username)
  }
  function logout () {
    localStorage.removeItem('username')
    this.myusername = ''
  }
  // ....

  return {
    /* states - currently no exported states*/
    /* getters */ sessionEndTime, sessionExpiry, ...
    /* actions */, login, logout, ...
  }
}, { persist: true } as any)
```

* store file with options syntax / without `setup` syntax
```javascript
// without setup-syntax
export const storeCounter = defineStore('counter', {
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
* store file for cookies
NOTE: NOT NEEDED! use: `useCookie('someCookie')`  at loast for reading
```javascript

const counter = useCookie('counter')
counter.value = counter.value || Math.round(Math.random() * 1000)

// export const useCookieStore = defineStore('main', {
//   state: () => {
//     return {
//       someCookie: 'hello pinia',
//     }
//   },
//   persist: {
//     storage: persistedState.cookiesWithOptions({
//       sameSite: 'strict', // optional
//     }),
//   },
// })
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
### installation and neccessary packages
```json
  "devDependencies": {
    "@nuxtjs/i18n": "^8.0.0-rc.4",
    ...
  }
```
### usage in template
out of the box
### usage in script setup
```vue
<script setup lang="ts">
const { t } = useI18n()
const translatedLabel = ref(t('button.reload.app'))
// or:
// const translatedLabel = ref('')
// translatedLabel.value = t('button.reload.app')
...
</script>
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
Possible options:
* using element plus icons: small collection :(
* recommendation from bootstrap-next unplugin-icons: large collection, including all bootstrap icons
* https://icon-sets.iconify.design/ : used by unplugin-icons, only needs one npm library, to be able to use a lot of libraries


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
* element-plus does not really has predefined classes (like justify-center, p-1, m-1, ...) -> we will use tailwind css.
* element plus does not support `variant="primary"` instead it uses `type="primary"` (they are configured to use the same colors currently for primary, secondary,...) See `assets/scss/vs-colors.scss`

Attention: make sure to use only elementplus and tailwind classes. not bootstrap-vue

To check which theme we are using currently there are several options:
* javascript:
```vue
<template>
  <el-button :type="settings.theme === 'light' ? 'primary' : 'secondary'" />
  <el-button :type="settings.isLight ? 'primary' : 'secondary'" />
  <!-- or through css -->
  <el-button class="thisisnotprimary-itsgreen" type="primary" />
  <el-button class="thisisnotprimary-itsred" type="primary" />
</template>
<script setup lang="ts">
const settings = storeSettings() // from settingsStore
</script>
<style>
webgui-theme-light .thisisnotprimary-itsgreen { background-color: green; }
webgui-theme-dark .thisisnotprimary-itsgreen { background-color: green; }
/* or */
body[data-bs-theme="light"] .thisisnotprimary-itsred { background-color: red; }
</style>
```
## Tailwind
We need tailwind for utility classes, cause we wanna replace bootstrapvue. ElementPlus does not support css classes like d-none / hidden, text-xs, ...
```bash
npm install -D tailwindcss
```
Full documentation about all utility classes: https://tailwindcss.com/docs/aspect-ratio

Hint: variant="primary" is used in bootstrap, type="primary" for elementplus. tailwind css does not know primary, secondary..... It has its own color palette with blue, red, yellow e.g. class="text-red-900" or class="bg-yellow-400"

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