
// import './assets/css/tailwind'
import 'assets/css/tailwind.css'
import { defineSetupVue3 } from '@histoire/plugin-vue';
import { createPinia } from 'pinia'

import en from './locale/opsiweb-ui_en.json'
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

export const setupVue3 = defineSetupVue3(({app}) => {
 // Vue plugin
  app.use(createPinia())
  // app.use(ElementPlus)
  app.use(createI18n({
    legacy: false,
    messages: { en }
  }))

})
