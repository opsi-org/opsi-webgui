// import Cookie from 'js-cookie'
import { Module, VuexModule, VuexMutation } from 'nuxt-property-decorator'

@Module({ name: 'changes', stateFactory: true, namespaced: true })
export default class Changes extends VuexModule {
  _changesProducts: Array<object> = []

  get changesProducts (): Array<object> { return this._changesProducts }

  @VuexMutation public setChangesProducts (s: Array<object>) { this._changesProducts = s }
  @VuexMutation public pushToChangesProducts (s: object) {
    const index = this._changesProducts.indexOf(s)
    if (index === -1) {
      this._changesProducts.push(s)
    }
  }

  @VuexMutation public delFromChangesProducts (s: object) {
    const index = this._changesProducts.indexOf(s)
    if (index !== -1) {
      this._changesProducts.splice(index, 1)
    }
  }

  @VuexMutation public clearAllChanges () {
    this._changesProducts = []
  }
}
