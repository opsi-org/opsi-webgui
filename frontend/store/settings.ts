import Cookie from 'js-cookie'
import { Module, VuexModule, VuexMutation } from 'nuxt-property-decorator'
import { ITheme } from '../.utils/types/tsettings'
import { IObjectString2Boolean } from '../.utils/types/tgeneral'
import { Cookies } from '../mixins/cookies'
import { IColumnLayoutCollapsed } from '../.utils/types/tobjects'

@Module({ name: 'settings', stateFactory: true, namespaced: true })
export default class Settings extends VuexModule {
  _language: string = Cookies.options.methods.getCookie('Language') as string || 'en'
  _quicksave: boolean = Cookies.options.methods.getCookie('Quicksave') as string === 'true' || (Cookie.get('Quicksave') as string === undefined) || false
  colorthemeobj: ITheme = { title: 'light', rel: 'themes/opsi-light.css', icon: 'sun' }
  _twoColumnLayoutCollapsed: IObjectString2Boolean = { tabledepots: false, tableclients: false }
  _expiresInterval!: NodeJS.Timeout|undefined

  get twoColumnLayoutCollapsed (): IObjectString2Boolean { return this._twoColumnLayoutCollapsed }
  get language (): string { return this._language }
  get quicksave (): boolean { return this._quicksave }
  get expiresInterval (): NodeJS.Timeout|undefined { return this._expiresInterval }
  get colortheme (): ITheme {
    if (Cookies.options.methods.getCookie('theme.title')) {
      const c: ITheme = {
        rel: Cookies.options.methods.getCookie('theme.rel') as string,
        title: Cookies.options.methods.getCookie('theme.title') as string
      }
      c.timestamp = (JSON.parse(Cookie.get('theme.timestamp') as string)) as number
      if (c.rel !== this.colorthemeobj.rel) {
        if (!this.colorthemeobj.timestamp) {
          return c
        }
        if (new Date(new Date(c.timestamp).toLocaleString(['en-EN'], { timeZone: 'Europe/Berlin' })).getTime() - this.colorthemeobj.timestamp < 0) {
          return c
        }
        return this.colorthemeobj
      }
    }
    return this.colorthemeobj
  }

  @VuexMutation public setExpiresInterval (int: NodeJS.Timeout|undefined) {
    if ((int === null || int === undefined) && this._expiresInterval) {
      clearInterval(this._expiresInterval)
    }
    this._expiresInterval = int
  }

  @VuexMutation public setLanguage (lang: string) {
    this._language = lang
    // Cookie.set('Language', this._language, { expires: 365 })
    Cookies.options.methods.setCookie('Language', this._language)
  }

  @VuexMutation public setQuicksave (isQuickSave: boolean) {
    this._quicksave = isQuickSave
    Cookies.options.methods.setCookie('Quicksave', (isQuickSave) ? 'true' : 'false')
  }

  @VuexMutation public setColumnLayoutCollapsed (obj: IColumnLayoutCollapsed) {
    this._twoColumnLayoutCollapsed[obj.parentId] = obj.value
  }

  @VuexMutation public setColorTheme (newThemeObj: ITheme) {
    this.colorthemeobj = newThemeObj
    this.colorthemeobj.timestamp = new Date(new Date().toLocaleString(['en-EN'], { timeZone: 'Europe/Berlin' })).getTime()
    Cookies.options.methods.setCookie('theme.title', this.colorthemeobj.title)
    Cookies.options.methods.setCookie('theme.timestamp', JSON.stringify(this.colorthemeobj.timestamp))
    Cookies.options.methods.setCookie('theme.rel', this.colorthemeobj.rel)
  }
}
