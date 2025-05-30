/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineStore } from 'pinia'
import { useColorMode } from '@vueuse/core'

type t_theme = 'light' | 'dark'

export const storeSettings = defineStore('settings', {
  persist: {
    key: 'opsi-settings',
    storage: localStorage,
  },
  state: () => ({
    isMobile: useMQ().isMobile.value as boolean,
    language: 'en',
    quicksave: false,
    quickpanelOpened: true as boolean,
    msgbusAutoRefresh: true as boolean,
    menuCollapsed: false as boolean,
    twoColumnLayoutCollapsed: { tabledepots: false, tableclients: false },
    expiresInterval: undefined as NodeJS.Timer | undefined,
    _colormodeCookie: (useColorMode().value == 'auto' ? 'light' : useColorMode().value) as t_theme,
  }),
  getters: {
    colormode: (state: any): t_theme => {
      return state._colormodeCookie
    },
    isLight: (state: any) => {
      return state._colormodeCookie === 'light'
    },
  },
  actions: {
    setExpiresInterval(int: NodeJS.Timer | undefined) {
      if ((int === null || int === undefined) && this.expiresInterval) {
        clearInterval(this.expiresInterval)
        window.clearInterval(this.expiresInterval)
      }
      this.expiresInterval = int
    },
    setLanguage(lang: string) {
      this.language = lang
      useCookie('Language').value = this.language
    },
    setQuicksave(isQuickSave: boolean) {
      this.quicksave = isQuickSave
      useCookie('Quicksave').value = isQuickSave ? 'true' : 'false'
    },
    setQuickpanelOpened(isQuickpanelOpened: boolean) {
      this.quickpanelOpened = isQuickpanelOpened
      useCookie('QuickpanelOpened').value = isQuickpanelOpened ? 'true' : 'false'
    },
    setMenuCollapsed(isMenuCollapsed: boolean) {
      this.menuCollapsed = isMenuCollapsed
    },
    setIsMobile(isMobile: boolean) {
      // only for testing purpose
      this.isMobile = isMobile
    },
    initColormode() {
      const colormode = this.colormode
      this.setColormode(colormode, false)
    },
    setColormode(colormode: t_theme, saveCookie = true) {
      if (saveCookie) {
        const mode = useColorMode()
        mode.value = colormode
        this._colormodeCookie = colormode
      }
      const isDark = colormode === 'dark'
      document.documentElement.classList.toggle('dark', isDark)
    },
    setDark(isDark: boolean, saveCookie = true) {
      this.setColormode(isDark ? 'dark' : 'light', saveCookie)
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeSettings, import.meta.hot))
}
