import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useDark, useToggle } from '@vueuse/core'

import type { ITheme } from '@/types/tsettings'
import type { IObjectString2Boolean } from '@/types/tgeneral'
import type { IColumnLayoutCollapsed } from '@/types/tobjects'
import { useIcons } from '~/composables/mixins/useIcons'
import _ from 'lodash'


export const storeSettings = defineStore('settings', {
  // persist: false,
  persist: {
    key: 'opsi-auth',
    storage: localStorage,
    // storage: sessionStorage,
  },
  state: () => ({
    isMobile: useMQ().isMobile.value as boolean,
    language: 'en',
    quicksave: false,
    quickpanelOpened: true as boolean,
    menuCollapsed: false as boolean,
    twoColumnLayoutCollapsed: { tabledepots: false, tableclients: false },
    expiresInterval: undefined as NodeJS.Timeout|undefined,
    // _colormode: 'auto' as 'light'|'dark'|'auto',
  }),
  getters: {
    // twoColumnLayoutCollapsed: (state: any) => state._twoColumnLayoutCollapsed,
    // isMobile: (state: any) => state._isMobile,
    // language: (state: any) => state._language,
    // quicksave: (state: any) => state._quicksave,
    // quickpanelOpened: (state: any) => state._quickpanelOpened,
    // menuCollapsed: (state: any) => state._menuCollapsed,
    // expiresInterval: (state: any) => state._expiresInterval,
    colormodeCookie: (state: any) => useCookie('colormode').value,
    colormode: (getter: any) => {
      // check if specific colormode for webgui is set
      // if colormode is auto, use bt-mode as default (and set ep-mode to this)
      // if colormode is not auto (specific), set bt and ep to colormode
      const _colormode = getter.colormodeCookie
      return _colormode as 'light'|'dark'|'auto'
    },
    isLight: (getter: any) => {
      return getter.colormode === 'light'
    }
  },
  actions: {
    setExpiresInterval (int: NodeJS.Timeout|undefined) {
      if ((int === null || int === undefined) && this.expiresInterval) {
        clearInterval(this.expiresInterval)
      }
      this.expiresInterval = int
    },
    setLanguage (lang: string) {
      this.language = lang
      // Cookie.set('Language', this._language, { expires: 365 })
      // Cookies.options.methods.setCookie('Language', this._language)
      useCookie('Language').value = this.language
    },
    setQuicksave (isQuickSave: boolean) {
      this.quicksave = isQuickSave
      useCookie('Quicksave').value = (isQuickSave) ? 'true' : 'false'
    },
    setQuickpanelOpened (isQuickpanelOpened: boolean) {
      this.quickpanelOpened = isQuickpanelOpened
      useCookie('QuickpanelOpened').value = (isQuickpanelOpened) ? 'true' : 'false'
    },
    setMenuCollapsed (isMenuCollapsed: boolean) {
      this.menuCollapsed = isMenuCollapsed
      useCookie('MenuCollapsed').value = (isMenuCollapsed) ? 'true' : 'false'
    },
    setIsMobile (isMobile: boolean) {
      // only for testing purpose
      this.isMobile = isMobile
    },
    setColumnLayoutCollapsed (obj: IColumnLayoutCollapsed) {
      this.twoColumnLayoutCollapsed[obj.parentId] = obj.value
    },
    initColormode () { // init colormode without saving as cookie
      const colormode = this.colormode // getter:
      // if colormode is auto use bt-mode as default (and set ep-mode to this)
      // if colormode is not auto set bt and ep to colormode
      this.setColormode(colormode, false)
    },
    toggleTheme() {
      let _mode = this.colormode
      const newMode = (_mode === 'light') ? 'dark' : 'light'
      this.setColormode(newMode)
    },
    setColormode (colormode: 'light'|'dark'|'auto', saveCookie = true) {
      if (saveCookie) {
        useCookie('colormode').value = colormode
      }
      const color_ep_isDark = useDark() // element plus
    },
  },
})


if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeSettings, import.meta.hot));
}

// export const storeSettings = defineStore('settings', () => {
//   // need to return the states / getters/ actions in the end of the setup
//   // states
//   let _isMobile = useMQ().isMobile.value
//   const _theme = ref(document.querySelector('html')?.classList.contains('dark') ? 'dark' : document.querySelector('html')?.classList.contains('htw-dark') ? 'dark' : 'light')
//   let _language: string = useCookie('Language').value || 'en'
//   let _quicksave: boolean = useCookie('Quicksave').value === 'true' || (useCookie('Quicksave').value === undefined) || false
//   let colorthemeobj: ITheme = { title: 'light', rel: 'themes/opsi-light.css', icon: useIcons().themelight }
//   let _twoColumnLayoutCollapsed: IObjectString2Boolean = { tabledepots: false, tableclients: false }
//   let _expiresInterval!: NodeJS.Timeout|undefined

//   // getter
//   const twoColumnLayoutCollapsed = computed(() => _twoColumnLayoutCollapsed)
//   const isMobile = computed(() => _isMobile)
//   const language = computed(() => _language)
//   const quicksave = computed(() => _quicksave)
//   const expiresInterval = computed(() => _expiresInterval)
//   const isLight = computed(() => _theme.value === 'light')
//   // const isLight = computed(() => colorthemeobj.title === 'light')
//   const colortheme = computed(() => {
//     return _theme.value
//     // if (useCookie('theme.title')) {
//     //   const c: ITheme = {
//     //     rel: useCookie('theme.rel').value as string,
//     //     title: useCookie('theme.title').value as string
//     //   }
//     //   try{
//     //     c.timestamp = (JSON.parse(useCookie('theme.timestamp').value || '')) as number
//     //   } catch (e) {
//     //     c.timestamp = new Date(new Date().toLocaleString(['en-EN'], { timeZone: 'Europe/Berlin' })).getTime()
//     //     console.warn(e)
//     //   }
//     //   if (c.rel !== colorthemeobj.rel) {
//     //     if (!colorthemeobj.timestamp) {
//     //       return c
//     //     }
//     //     if (new Date(new Date(c.timestamp).toLocaleString(['en-EN'], { timeZone: 'Europe/Berlin' })).getTime() - colorthemeobj.timestamp < 0) {
//     //       return c
//     //     }
//     //     return colorthemeobj
//     //   }
//     // }
//     // return colorthemeobj
//   })

//   // actions

//   function setExpiresInterval (int: NodeJS.Timeout|undefined) {
//     if ((int === null || int === undefined) && _expiresInterval) {
//       clearInterval(_expiresInterval)
//     }
//     _expiresInterval = int
//   }

//   function setLanguage (lang: string) {
//     _language = lang
//     // Cookie.set('Language', _language, { expires: 365 })
//     // Cookies.options.methods.setCookie('Language', _language)
//     useCookie('Language').value = _language
//   }

//   function setQuicksave (isQuickSave: boolean) {
//     _quicksave = isQuickSave
//     useCookie('Quicksave').value = (isQuickSave) ? 'true' : 'false'
//   }
//   function setIsMobile (isMobile: boolean) {
//     // only for testing purpose
//     _isMobile = isMobile
//   }

//   function setColumnLayoutCollapsed (obj: IColumnLayoutCollapsed) {
//     _twoColumnLayoutCollapsed[obj.parentId] = obj.value
//   }

//   function setColorTheme (newThemeObj: ITheme) {
//     _theme.value = newThemeObj.title
//     // colorthemeobj = newThemeObj
//     // colorthemeobj.timestamp = new Date(new Date().toLocaleString(['en-EN'], { timeZone: 'Europe/Berlin' })).getTime()
//     // useCookie('theme.title').value = colorthemeobj.title
//     // useCookie('theme.timestamp').value = JSON.stringify(colorthemeobj.timestamp)
//     // useCookie('theme.rel').value = colorthemeobj.rel
//   }

//   function changeTheme(t:string) {
//     _theme.value = t
//       // `this` is the store instance
//     const _colorthemeobj = { title: 'light', rel: 'themes/opsi-light.css', icon: useIcons().themelight }
//     // const color = useColorMode() // bootstrap
//     const isDark = useDark()
//     // color.preference ='light'
//     useToggle(isDark)

//     if (t==='dark'){
//       // color.value = 'dark'
//       _colorthemeobj.title = t
//       _colorthemeobj.rel = 'themes/opsi-dark.css'
//       _colorthemeobj.icon = useIcons().themedark
//     }
//     setColorTheme(_colorthemeobj)
//   }

//   return {
//     /* states */
//     /* getters */ isMobile,
//                   isLight,
//                   twoColumnLayoutCollapsed,
//                   language,
//                   quicksave,
//                   expiresInterval,
//                   colortheme
//     /* actions */, setExpiresInterval,
//                     setLanguage,
//                     setQuicksave,
//                     setColumnLayoutCollapsed,
//                     setColorTheme,
//                     changeTheme,
//                     setIsMobile, // only for testing purpose
//   }
// }, { persist: true } as any)
