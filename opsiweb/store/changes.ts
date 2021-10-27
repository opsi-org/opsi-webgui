import { Module, VuexModule, VuexMutation } from 'nuxt-property-decorator'

@Module({ name: 'changes', stateFactory: true, namespaced: true })
export default class Changes extends VuexModule {
  _changesProducts: Array<any> = []

  get changesProducts (): Array<object> { return this._changesProducts }

  @VuexMutation public pushToChangesProducts (obj: object) {
    this._changesProducts.push(obj)
  }

  @VuexMutation public delWithIndexChangesProducts (index: number) {
    this._changesProducts.splice(index, 1)
  }

  @VuexMutation public delFromChangesProducts (obj: object) {
    this._changesProducts.splice(this._changesProducts.indexOf(obj), 1)
  }

  @VuexMutation public deleteAllChanges () {
    // this._changesProducts.splice(0, this._changesProducts.length)
    const removeItems = this._changesProducts.filter(item => item.user === localStorage.getItem('username'))
    removeItems.forEach(f => this._changesProducts.splice(this._changesProducts.findIndex(item => item.user === f.user), 1))
  }
}
