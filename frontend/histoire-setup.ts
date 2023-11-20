
// import './assets/css/tailwind'
import 'assets/css/tailwind.css'
// import 'assets/scss/element/index.scss'
// import './dark-mode'
// import './theme/style.css'

import { defineSetupVue3 } from '@histoire/plugin-vue';
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'


import en from './locale/opsiweb-ui_de.json'
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
  app.use(ElementPlus)
  app.use(createI18n({
    legacy: false,
    messages: { en }
  }))

})
