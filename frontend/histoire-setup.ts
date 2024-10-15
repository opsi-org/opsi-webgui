
import './assets/css/tailwind.css'
import './assets/scss/index.scss'

import { defineSetupVue3 } from '@histoire/plugin-vue';
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import WrapperGlobal from './histoire/histoire-wrapper-mobile.vue'
import en from './locale/opsi-webgui_en.json'
import { createI18n } from "vue-i18n";
// function setupApp ({ app, story, variant }) {
//   // Router mock
//   app.use(createRouter({
//     history: createMemoryHistory(),
//     routes: [
//       { path: '/', name: 'home', component: { render: () => null } },
//     ],
//   }))
// }

export const setupVue3 = defineSetupVue3(({app, addWrapper}) => {
 // Vue plugin

  addWrapper(WrapperGlobal)
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate);
  app.use(pinia)
  app.use(createI18n({
    legacy: false,
    messages: { en }
  }))

})
