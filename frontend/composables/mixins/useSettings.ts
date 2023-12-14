
export const useSettingsLanguage = () => {
  const settings = storeSettings()
  const language = settings.language
  const setLanguage = settings.setLanguage

  onBeforeMount (()=> {
    if (language) {
      // $i18n.locale = language
      const { locale } = useI18n()
      locale.value = language
    }
  })
  return {language, setLanguage}
}

export const useSettings = () => {
  const settings = storeSettings()
  const colortheme = settings.colortheme

  const CONST_LIGHT = 'theme-light'
  const CONST_DARK = 'theme-dark'

  function themeclass (): string {
    return (colortheme === 'light') ? CONST_LIGHT : CONST_DARK
    // return (colortheme && colortheme.title === 'light') ? CONST_LIGHT : CONST_DARK
  }
  return { colortheme, CONST_DARK, CONST_LIGHT, themeclass}
}
