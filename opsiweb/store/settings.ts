import Cookie from 'js-cookie'
import { Module, VuexModule, VuexMutation } from 'nuxt-property-decorator'
import { ITheme } from '@/types/tsettings'

@Module({ name: 'settings', stateFactory: true, namespaced: true })
export default class Settings extends VuexModule {
  colorthemeobj: ITheme = { title: 'Bootswatch-Sketchy', rel: 'https://stackpath.bootstrapcdn.com/bootswatch/4.5.2/sketchy/bootstrap.min.css' }

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

  @VuexMutation // ({ mutate: ['colorthemeobj'] })
  public setColorTheme (newThemeObj: ITheme) {
    this.colorthemeobj = newThemeObj
    this.colorthemeobj.timestamp = new Date(new Date().toLocaleString(['en-EN'], { timeZone: 'Europe/Berlin' })).getTime()
    // Cookie.set('theme', JSON.stringify(newThemeObj))
    Cookie.set('theme.title', this.colorthemeobj.title)
    Cookie.set('theme.timestamp', JSON.stringify(this.colorthemeobj.timestamp))
    Cookie.set('theme.rel', this.colorthemeobj.rel)
  }
}
