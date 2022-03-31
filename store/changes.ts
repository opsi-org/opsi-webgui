/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: do not use type 'object' define it in details through an interface
import { Module, VuexModule, VuexMutation } from 'nuxt-property-decorator'

@Module({ name: 'changes', stateFactory: true, namespaced: true })
export default class Changes extends VuexModule {
  _changesProducts: Array<any> = []

  get changesProducts (): Array<any> {
    console.log('CHANGES: ', this._changesProducts)
    return this._changesProducts
  }

  @VuexMutation public pushToChangesProducts (obj: object) {
    this._changesProducts.push(obj)
  }

  @VuexMutation public delWithIndexChangesProducts (index: number) {
    this._changesProducts.splice(index, 1)
  }

  @VuexMutation public delFromChangesProducts (obj: object) {
    this._changesProducts.splice(this._changesProducts.indexOf(obj), 1)
  }

  @VuexMutation public deleteFromChangesWhere (hostKV: Array<any>, objectKV:Array<any>, additionalKV: Array<any>) {
    let removeItems = this._changesProducts.filter(item => item.user === localStorage.getItem('username'))
    // filter by hosts
    removeItems = removeItems.filter(item => hostKV[1].includes(item[hostKV[0]]))
    // filter by e.g. productId
    if (objectKV) { removeItems = removeItems.filter(item => item[objectKV[0]] === hostKV[1]) }
    // filter by e.g. propertyId
    if (additionalKV) { removeItems = removeItems.filter(item => item[additionalKV[0]] === additionalKV[1]) }

    // remove filtered elements
    removeItems.forEach(f => this._changesProducts.splice(this._changesProducts.findIndex(item => item === f), 1))
  }

  @VuexMutation public deleteAllChanges () {
    // this._changesProducts.splice(0, this._changesProducts.length)
    const removeItems = this._changesProducts.filter(item => item.user === localStorage.getItem('username'))
    removeItems.forEach(f => this._changesProducts.splice(this._changesProducts.findIndex(item => item.user === f.user), 1))
  }
}
