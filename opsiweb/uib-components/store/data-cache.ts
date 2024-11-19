import { Module, VuexModule, VuexMutation } from 'nuxt-property-decorator'
// chimport { ITheme } from '~/types/tsettings'

@Module({ name: 'data-cache', stateFactory: true, namespaced: true })
export default class DataCache extends VuexModule {
  $axios: any
  _opsiconfigserver: string = ''
  _authmethods: string = ''

  // get opsiconfigserver (): string { return this._opsiconfigserver }
  get opsiconfigserver (): string {
    return this._opsiconfigserver
  }

  get authmethods (): string {
    return this._authmethods
  }
  // set configserverId (s: string) { this.opsiconfigserver = s }

  @VuexMutation setOpsiconfigserver (s: string) {
    this._opsiconfigserver = s
  }

  @VuexMutation setAuthmethods (s: string) {
    this._authmethods = s
  }
}
