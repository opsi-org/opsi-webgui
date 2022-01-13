import Cookie from 'js-cookie'
import { Module, VuexModule, VuexMutation } from 'nuxt-property-decorator'
// chimport { ITheme } from '~/types/tsettings'

@Module({ name: 'settings', stateFactory: true, namespaced: true })
export default class Settings extends VuexModule {
  myusername: string = localStorage.getItem('username') as string
  sessionendTime: string = ''

  get sessionEndTime (): string { return this.sessionendTime }

  get username (): string { return this.myusername }
  get isAuthenticated (): Boolean { return Boolean(Cookie.get('opsiconfd-session') && localStorage.getItem('username')) }

  @VuexMutation login (username: string) {
    this.myusername = username
    localStorage.setItem('username', username)
    // console.log('cookie set')
  }

  @VuexMutation logout () {
    localStorage.removeItem('username')
    this.myusername = ''
    // Cookie.remove('opsiconf-session')
    // console.log('cookie removed')
  }

  @VuexMutation setSession (seconds: number) {
    const expiryInMinutes = seconds
    const expiryTime = new Date(new Date().getTime() + (expiryInMinutes * 60 * 1000))
    this.sessionendTime = expiryTime as unknown as string
    // Cookie.set('opsiweb-session', expiryTime as unknown as string, { expires: expiryTime })
  }

  @VuexMutation clearSession () {
    this.sessionendTime = ''
    // Cookie.remove('opsiweb-session')
  }
}
