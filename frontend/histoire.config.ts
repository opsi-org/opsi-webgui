import { defineConfig } from 'histoire'
import { HstVue } from '@histoire/plugin-vue'
import { HstNuxt } from '@histoire/plugin-nuxt'
// import './assets/scss/bv-colors.scss'
export default defineConfig({
  plugins: [
    HstVue(),
    HstNuxt(),
  ],
  collectMaxThreads: 2, // 8 threads takes longer..
  // setupFile: './histoire/histoire-setup.ts',
  setupFile: 'histoire-setup.ts',
  tree: {
    file: (file) => [...file.path.split('/').slice(1, -1), file.title],
    order: 'asc',
  },
  // defaultStoryProps: {
  //   // icon: 'carbon:assembly-reference',
  //   // iconColor: '#00c5a5',
  //   // layout: {
  //   //   type: 'grid',
  //   //   width: 300,
  //   // },
  //   // responsiveDisabled: true,
  //   // autoPropsDisabled: true,
  // },
  vite: {
    server: {
      host: '0.0.0.0', // of histoire
      port: 6006,
      https: { // development
        key: '.config/https/server.key',
        cert: '.config/https/server.crt'
      },
      proxy: {
        "/addons/webgui/api": {
          target: "https://localhost:4447/",
          // changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
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
