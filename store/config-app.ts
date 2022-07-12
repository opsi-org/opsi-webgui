import { Module, VuexModule, VuexMutation } from 'nuxt-property-decorator'
import { IObjectString2Boolean } from '../.utils/types/tgeneral'

@Module({ name: 'config-app', stateFactory: true, namespaced: true })
export default class ConfigApp extends VuexModule {
  _config: IObjectString2Boolean|undefined = undefined
  _readonly: boolean = false

  get config (): IObjectString2Boolean|undefined { return this._config }
  get readonly (): Boolean { return this._readonly }

  @VuexMutation public setConfig (obj: IObjectString2Boolean) {
    this._config = obj
  }
}
