import { defineConfig } from 'histoire'
import { HstVue } from '@histoire/plugin-vue'
import { HstNuxt } from '@histoire/plugin-nuxt'

export default defineConfig({
  plugins: [
    HstVue(),
    HstNuxt(),
  ],
  setupFile: 'histoire-setup.ts',
  vite: {
    server: {
      host: '0.0.0.0',
    },
    css:{
      preprocessorOptions: {
        scss: {
          additionalData: `@use "assets/scss/element/index.scss" as element;`,
        },
      },
    },
  },
})
