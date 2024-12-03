export const useSettingsLanguage = () => {
  const settings = storeSettings()
  const language = settings.language
  const setLanguage = settings.setLanguage

  onBeforeMount(() => {
    if (language) {
      // $i18n.locale = language
      const { locale } = useI18n()
      locale.value = language
    }
  })
  return { language, setLanguage }
}
