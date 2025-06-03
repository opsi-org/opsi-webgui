/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import './assets/scss/tailwind.scss'
import './assets/scss/index.scss'

import { defineSetupVue3 } from '@histoire/plugin-vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import PrimeVue from 'primevue/config'
import WrapperGlobal from './histoire/histoire-wrapper-mobile.vue'
import en from './locale/opsi-webgui_en.json'
import { createI18n } from 'vue-i18n'

// https://github.com/histoire-dev/histoire/issues/721#issuecomment-2408077600
// history and primevue css layer does not work correctly. currently the issue is opened, but has following worksaround
document.head
  .querySelectorAll("style[type='text/css'][data-vite-dev-id*='histoire']")
  .forEach((style) => {
    style.setAttribute('data-layer', 'histoire')
    const content = style.textContent
    if (!content?.includes('@layer')) {
      style.textContent = `@layer histoire {${content}}`
    }
  })

export const setupVue3 = defineSetupVue3(({ app, addWrapper }) => {
  // Vue plugin

  addWrapper(WrapperGlobal)
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)

  app.use(PrimeVue, {
    theme: 'none',
  })
  app.use(
    createI18n({
      legacy: false,
      messages: { en },
    })
  )
})
