import { createI18n } from 'vue-i18n'
import en from '../locale/en.json'
import de from '../locale/de.json'

export default defineNuxtPlugin(({ vueApp }) => {
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'de',
    messages: { en, de }
  })
  vueApp.use(i18n)
})

// // You can use `defineI18nConfig` to get type inferences for options to pass to vue-i18n.
// export default defineI18nConfig(() => {
//   return {
//     legacy: false,
//     locale: 'en',
//     messages: {
//       en,
//       de
//     }
//   }
// })

