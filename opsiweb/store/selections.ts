// import Cookie from 'js-cookie'
import { Module, VuexModule, VuexMutation } from 'nuxt-property-decorator'

@Module({ name: 'selections', stateFactory: true, namespaced: true })
export default class Selections extends VuexModule {
  _selectionDepots: Array<string> = []
  _selectionClients: Array<string> = []
  _selectionProducts: Array<string> = []

  get selectionDepots (): Array<string> { return this._selectionDepots }
  get selectionClients (): Array<string> { return this._selectionClients }
  get selectionProducts (): Array<string> { return this._selectionProducts }

  @VuexMutation public setSelectionDepots (s: Array<string>) { this._selectionDepots = s }
  @VuexMutation public setSelectionClients (s: Array<string>) { this._selectionClients = s }
  @VuexMutation public setSelectionProducts (s: Array<string>) { this._selectionProducts = s }
}
