import { Module, VuexModule, VuexMutation } from 'nuxt-property-decorator'

@Module({ name: 'changes', stateFactory: true, namespaced: true })
export default class Changes extends VuexModule {
  // _changesProducts: Array<object> = []
  _changesProducts: Array<any> = []

  get changesProducts (): Array<object> { return this._changesProducts }

  @VuexMutation public setChangesProducts (arr: Array<object>) { this._changesProducts = arr }
  @VuexMutation public pushToChangesProducts (obj: object) {
    this._changesProducts.push(obj)
  }

  @VuexMutation public updateChangesProductProperty (index: number, obj: any) {
    const object = this._changesProducts[index]
    object.property = obj.propertyId
    object.value = obj.values
  }

  @VuexMutation public delWithIndexChangesProducts (index: number) {
    this._changesProducts.splice(index, 1)
  }

  @VuexMutation public delFromChangesProducts (obj: object) {
    this._changesProducts.splice(this._changesProducts.indexOf(obj), 1)
  }

  @VuexMutation public deleteAllChanges () {
    this._changesProducts.splice(0, this._changesProducts.length)
  }
}
