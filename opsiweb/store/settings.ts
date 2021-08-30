import Cookie from 'js-cookie'
import { Module, VuexModule, VuexMutation } from 'nuxt-property-decorator'
import { IObjectString2Boolean, ITheme } from '@/types/tsettings'
interface IColumnLayoutCollaped {
  parentId: string,
  value: boolean
}
@Module({ name: 'settings', stateFactory: true, namespaced: true })
export default class Settings extends VuexModule {
  _language: string = Cookie.get('Language') as string || 'en'
  _expert: boolean = Cookie.get('ExpertMode') as string === 'expert' || false
  colorthemeobj: ITheme = { title: 'opsi-light', rel: 'themes/opsi-bootstrap-theme-light.css' }
  _twoColumnLayoutCollapsed: IObjectString2Boolean = { tabledepots: false, tableclients: false }

  get twoColumnLayoutCollapsed (): IObjectString2Boolean { return this._twoColumnLayoutCollapsed }
  get language (): string { return this._language }
  get expert (): boolean { return this._expert }
  get colortheme (): ITheme {
    if (Cookie.get('theme.title')) {
      const c: ITheme = {
        rel: Cookie.get('theme.rel') as string,
        title: Cookie.get('theme.title') as string
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

  @VuexMutation public setLanguage (lang: string) {
    this._language = lang
    Cookie.set('Language', this._language, { expires: 365 })
  }

  @VuexMutation public setExpertmode (isExpert: boolean) {
    this._expert = isExpert
    Cookie.set('ExpertMode', (isExpert) ? 'expert' : 'normal', { expires: 365 })
  }

  @VuexMutation public setColumnLayoutCollapsed (obj: IColumnLayoutCollaped) {
    this._twoColumnLayoutCollapsed[obj.parentId] = obj.value
  }

  @VuexMutation public setColorTheme (newThemeObj: ITheme) {
    this.colorthemeobj = newThemeObj
    this.colorthemeobj.timestamp = new Date(new Date().toLocaleString(['en-EN'], { timeZone: 'Europe/Berlin' })).getTime()
    Cookie.set('theme.title', this.colorthemeobj.title)
    Cookie.set('theme.timestamp', JSON.stringify(this.colorthemeobj.timestamp))
    Cookie.set('theme.rel', this.colorthemeobj.rel)
  }
}
