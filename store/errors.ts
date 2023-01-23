/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: do not use type 'object' define it in details through an interface
import { Module, VuexModule, VuexMutation } from 'nuxt-property-decorator'

@Module({ name: 'errors', stateFactory: true, namespaced: true })
export default class Errors extends VuexModule {
  _errorsProducts: Array<any> = []
  _errorsHostParam: Array<any> = []

  get errorsProducts (): Array<any> {
    return this._errorsProducts
  }

  @VuexMutation public pushToErrorsProducts (obj: object) {
    this._errorsProducts.push(obj)
  }

  @VuexMutation public delFromErrorsProducts (obj: object) {
    this._errorsProducts.splice(this._errorsProducts.indexOf(obj), 1)
  }

  @VuexMutation public deleteAllErrorsProducts () {
    this._errorsProducts.splice(0, this._errorsProducts.length)
  }

  get errorsHostParam (): Array<any> {
    return this._errorsHostParam
  }

  @VuexMutation public pushToErrorsHostParam (obj: object) {
    this._errorsHostParam.push(obj)
  }

  @VuexMutation public delFromErrorsHostParam (obj: object) {
    this._errorsHostParam.splice(this._errorsHostParam.indexOf(obj), 1)
  }

  @VuexMutation public deleteAllErrorsHostParam () {
    this._errorsHostParam.splice(0, this._errorsHostParam.length)
  }
}
