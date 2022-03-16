import { Module, VuexModule, VuexMutation } from 'nuxt-property-decorator'
// chimport { ITheme } from '~/types/tsettings'

@Module({ name: 'data-cache', stateFactory: true, namespaced: true })
export default class Settings extends VuexModule {
  $axios: any
  _opsiconfigserver: string = ''

  // get opsiconfigserver (): string { return this._opsiconfigserver }
  get opsiconfigserver (): string {
    // if (this._opsiconfigserver === '') {
    //   this._opsiconfigserver = (await this.$axios.$get('/api/user/opsiserver')).result
    // }
    return this._opsiconfigserver
  }
  // set configserverId (s: string) { this.opsiconfigserver = s }

  @VuexMutation setOpsiconfigserver (s: string) {
    this._opsiconfigserver = s
  }
}
