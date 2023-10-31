/* eslint-disable @typescript-eslint/no-explicit-any */
import { Module, VuexModule, VuexMutation } from 'nuxt-property-decorator'

@Module({ name: 'errors', stateFactory: true, namespaced: true })
export default class Errors extends VuexModule {
  _errorsProducts: Array<any> = []
  _errorsHostParam: Array<any> = []

  get errorsProducts (): Array<any> {
    return this._errorsProducts
  }

  get errorsHostParam (): Array<any> {
    return this._errorsHostParam
  }

  @VuexMutation public pushToErrorsProducts (obj: object) {
    this._errorsProducts.push(obj)
  }

  @VuexMutation public clearErrorsProducts () {
    this._errorsProducts = []
  }

  @VuexMutation public pushToErrorsHostParam (obj: object) {
    this._errorsHostParam.push(obj)
  }

  @VuexMutation public clearErrorsHostParam () {
    this._errorsHostParam = []
  }
}
