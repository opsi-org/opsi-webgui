// import Cookie from 'js-cookie'
import { Module, VuexModule, VuexMutation } from 'nuxt-property-decorator'

@Module({ name: 'selections', stateFactory: true, namespaced: true })
export default class Selections extends VuexModule {
  // colorthemeobj: ITheme = { title: 'Bootswatch-Sketchy', rel: 'https://stackpath.bootstrapcdn.com/bootswatch/4.5.2/sketchy/bootstrap.min.css' }
  _selectionDepots: Array<string> = []
  _selectionClients: Array<string> = []

  get selectionDepots (): Array<string> { return this._selectionDepots }
  get selectionClients (): Array<string> { return this._selectionClients }

  @VuexMutation public setSelectionDepots (s: Array<string>) { this._selectionDepots = s }
  @VuexMutation public setSelectionClients (s: Array<string>) { this._selectionClients = s }
}
