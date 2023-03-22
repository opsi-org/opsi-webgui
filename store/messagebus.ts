import { Module, VuexModule, VuexMutation } from 'nuxt-property-decorator'

@Module({ name: 'mbus', stateFactory: true, namespaced: true })
export default class ConfigApp extends VuexModule {
  _bus: WebSocket|undefined = undefined
  _busterminal: WebSocket|undefined = undefined
  _bus_last_msg: any = undefined

  get bus (): WebSocket|undefined { return this._bus }
  get busterminal (): WebSocket|undefined { return this._busterminal }
  get wsBusMsg (): any { return this._bus_last_msg }

  @VuexMutation public setBus (bus: WebSocket|undefined) {
    this._bus = bus
  }

  @VuexMutation public setBusTerminal (bus: WebSocket|undefined) {
    this._busterminal = bus
  }

  @VuexMutation public setBusLastMsg (obj: any) {
    this._bus_last_msg = obj
  }
}
