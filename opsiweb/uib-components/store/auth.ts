import Cookie from 'js-cookie'
import { Module, VuexModule, VuexMutation } from 'nuxt-property-decorator'

const expirySec = 60 * 30 // Default=30min
@Module({ name: 'settings', stateFactory: true, namespaced: true })
export default class Settings extends VuexModule {
  myusername: string = localStorage.getItem('username') as string
  sessionexpiry: number = expirySec // sec
  sessionendTime: string = ''

  get sessionEndTime (): string { return this.sessionendTime }
  get sessionExpiry (): number { return this.sessionexpiry }
  get username (): string { return this.myusername }
  get isAuthenticated (): boolean { return Boolean(Cookie.get('opsiconfd-session') && localStorage.getItem('username')) }

  @VuexMutation login (username: string) {
    this.myusername = username
    localStorage.setItem('username', username)
  }

  @VuexMutation logout () {
    localStorage.removeItem('username')
    this.myusername = ''
  }

  @VuexMutation setExpiredMin (m: number) {
    this.sessionexpiry = m
  }

  @VuexMutation setSession () {
    let expiryInSec = this.sessionexpiry
    if (!expiryInSec) { expiryInSec = this.sessionExpiry }
    if (!expiryInSec) { expiryInSec = expirySec }

    const expiryTime = new Date(new Date().getTime() + (expiryInSec * 1000))
    this.sessionendTime = expiryTime as unknown as string
    // Cookie.set('opsiweb-session', expiryTime as unknown as string, { expires: expiryTime })
  }

  @VuexMutation clearSession () {
    this.sessionendTime = ''
    // Cookie.remove('opsiweb-session')
  }
}
