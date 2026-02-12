/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineStore } from 'pinia'
import { useColorMode } from '@vueuse/core'

type TDefaultLangs = 'en' | 'de' // in production more

type t_theme = 'light' | 'dark'
const mq = useMQ()

export const storeSettings = defineStore('settings', {
  persist: {
    key: 'opsi-settings',
    storage: localStorage,
  },
  state: () => ({
    isMobile: mq.isMobile.value as boolean,
    language: 'en' as TDefaultLangs,
    quickpanelOpened: true as boolean,
    msgbusAutoRefresh: true as boolean,
    menuCollapsed: false as boolean,
    twoColumnLayoutCollapsed: { tabledepots: false, tableclients: false },
    expiresInterval: undefined as number | undefined,
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
    setExpiresInterval(int: number | undefined) {
      if ((int === null || int === undefined) && this.expiresInterval) {
        clearInterval(this.expiresInterval)
        window.clearInterval(this.expiresInterval)
      }
      this.expiresInterval = int
    },
    setLanguage(lang: TDefaultLangs) {
      this.language = lang
      useCookie('Language').value = this.language
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

    initLanguage() {
      // Set initial locale if not already set
      if (this.language === null || this.language === undefined) this.language = 'en'
      const isValidLang = (lang: any): lang is TDefaultLangs =>
        useI18n().availableLocales.includes(lang)

      if (!isValidLang(this.language)) {
        return
      }

      if (this.language && isValidLang(this.language)) {
        useI18n().setLocale(this.language as any)
      } else {
        const cookieLang = useCookie('Language').value as TDefaultLangs
        if (cookieLang && isValidLang(cookieLang)) {
          this.language = cookieLang
          useI18n().setLocale(this.language as any)
        } else {
          const browserLang = navigator.language.split('-')[0] as TDefaultLangs
          if (browserLang && isValidLang(browserLang)) {
            this.language = browserLang as TDefaultLangs
            useI18n().setLocale(this.language as any)
            useCookie('Language').value = browserLang
          } else {
            this.language = 'en'
            useI18n().setLocale('en')
            useCookie('Language').value = 'en'
          }
        }
      }
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
