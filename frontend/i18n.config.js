import en from './locale/opsi-webgui_en.json'
import de from './locale/opsi-webgui_de.json'

// You can use `defineI18nConfig` to get type inferences for options to pass to vue-i18n.
export default defineI18nConfig(() => {
  return {
    legacy: false,
    locale: 'en',
    messages: {
      en,
      de,
    },
  }
})
