/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
export const useSettingsLanguage = () => {
  const settings = storeSettings()
  const language = settings.language
  const setLanguage = settings.setLanguage

  onBeforeMount(() => {
    if (language) {
      const { locale } = useI18n()
      locale.value = language
    }
  })
  return { language, setLanguage }
}
