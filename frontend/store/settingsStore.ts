import { defineStore } from 'pinia'
import { computed } from 'vue'

import type { ITheme } from '@/types/tsettings'
import type { IObjectString2Boolean } from '@/types/tgeneral'
import type { IColumnLayoutCollapsed } from '@/types/tobjects'
import { useIcons } from '~/composables/mixins/useIcons'

export const storeSettings = defineStore('settings', () => {
  // need to return the states / getters/ actions in the end of the setup
  // states
  const _theme = 'light'
  let _language: string = useCookie('Language').value || 'en'
  let _quicksave: boolean = useCookie('Quicksave').value === 'true' || (useCookie('Quicksave').value === undefined) || false
  let colorthemeobj: ITheme = { title: 'light', rel: 'themes/opsi-light.css', icon: useIcons().themelight }
  let _twoColumnLayoutCollapsed: IObjectString2Boolean = { tabledepots: false, tableclients: false }
  let _expiresInterval!: NodeJS.Timeout|undefined

  // getter
  const twoColumnLayoutCollapsed = computed(() => _twoColumnLayoutCollapsed)
  const language = computed(() => _language)
  const quicksave = computed(() => _quicksave)
  const expiresInterval = computed(() => _expiresInterval)
  const isLight = computed(() => colorthemeobj.title === 'light')
  const colortheme = computed(() => {
    if (useCookie('theme.title')) {
      const c: ITheme = {
        rel: useCookie('theme.rel').value as string,
        title: useCookie('theme.title').value as string
      }
      // TODO realy needed?
      c.timestamp = (JSON.parse(useCookie('theme.timestamp').value || '')) as number
      if (c.rel !== colorthemeobj.rel) {
        if (!colorthemeobj.timestamp) {
          return c
        }
        if (new Date(new Date(c.timestamp).toLocaleString(['en-EN'], { timeZone: 'Europe/Berlin' })).getTime() - colorthemeobj.timestamp < 0) {
          return c
        }
        return colorthemeobj
      }
    }
    return colorthemeobj
  })

  // actions

  function setExpiresInterval (int: NodeJS.Timeout|undefined) {
    if ((int === null || int === undefined) && _expiresInterval) {
      clearInterval(_expiresInterval)
    }
    _expiresInterval = int
  }

  function setLanguage (lang: string) {
    _language = lang
    // Cookie.set('Language', _language, { expires: 365 })
    // Cookies.options.methods.setCookie('Language', _language)
    useCookie('Language').value = _language
  }

  function setQuicksave (isQuickSave: boolean) {
    _quicksave = isQuickSave
    useCookie('Quicksave').value = (isQuickSave) ? 'true' : 'false'
  }

  function setColumnLayoutCollapsed (obj: IColumnLayoutCollapsed) {
    _twoColumnLayoutCollapsed[obj.parentId] = obj.value
  }

  function setColorTheme (newThemeObj: ITheme) {
    colorthemeobj = newThemeObj
    colorthemeobj.timestamp = new Date(new Date().toLocaleString(['en-EN'], { timeZone: 'Europe/Berlin' })).getTime()
    useCookie('theme.title').value = colorthemeobj.title
    useCookie('theme.timestamp').value = JSON.stringify(colorthemeobj.timestamp)
    useCookie('theme.rel').value = colorthemeobj.rel
  }

  function changeTheme(t:string) {
      // `this` is the store instance
    const _colorthemeobj = { title: 'light', rel: 'themes/opsi-light.css', icon: useIcons().themelight }
    if (t==='dark'){
      _colorthemeobj.title = t
      _colorthemeobj.rel = 'themes/opsi-dark.css'
      _colorthemeobj.icon = useIcons().themedark
    }
    setColorTheme(_colorthemeobj)
  }

  return {
    /* states */
    /* getters */ isLight,
                  twoColumnLayoutCollapsed,
                  language,
                  quicksave,
                  expiresInterval,
                  colortheme
    /* actions */, setExpiresInterval,
                    setLanguage,
                    setQuicksave,
                    setColumnLayoutCollapsed,
                    setColorTheme,
                    changeTheme
  }
}, { persist: true } as any)



// import { defineStore } from 'pinia'

// export const useSettingsStore = defineStore('settings', {
//   persist: true,
//   state: () => ({
//     theme: 'light',
//   }),
//   getters: {
//     isLight() { return theme === 'light' }
//   },
//   actions: {
//     changeTheme(t) {
//       // `this` is the store instance
//       theme = t
//     },
//   },
// })


// if (import.meta.hot) {
//   import.meta.hot.accept(acceptHMRUpdate(useMainStore, import.meta.hot));
// }