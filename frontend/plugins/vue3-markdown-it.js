import Markdown from 'vue3-markdown-it'

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.use(Markdown)
})
