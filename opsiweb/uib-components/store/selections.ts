import { Module, VuexModule, VuexMutation } from 'nuxt-property-decorator'

@Module({ name: 'selections', stateFactory: true, namespaced: true })
export default class Selections extends VuexModule {
  _selectionDepots: Array<string> = []
  _selectionClients: Array<string> = []
  _selectionProducts: Array<string> = []

  _selectionLogClient: string = ''
  _selectionLogType: string = 'instlog'
  _selectionLogLevel: number = 5

  get selectionDepots (): Array<string> { return this._selectionDepots }
  get selectionClients (): Array<string> { return this._selectionClients }
  get selectionProducts (): Array<string> { return this._selectionProducts }

  get XselectionLogClient (): string { return this._selectionLogClient }
  get XselectionLogType (): string { return this._selectionLogType }
  get XselectionLogLevel (): number { return this._selectionLogLevel }
  @VuexMutation public XsetSelectionLogClient (s: string) { this._selectionLogClient = s }
  @VuexMutation public XsetSelectionLogType (s: string) { this._selectionLogType = s }
  @VuexMutation public XsetSelectionLogLevel (s: number) { this._selectionLogLevel = s }

  @VuexMutation public setSelectionDepots (s: Array<string>) { this._selectionDepots = s }
  @VuexMutation public pushToSelectionDepots (s: string) {
    const index = this._selectionDepots.indexOf(s)
    if (index === -1) {
      this._selectionDepots.push(s)
    }
  }

  @VuexMutation public delFromSelectionDepots (s: string) {
    const index = this._selectionDepots.indexOf(s)
    if (index !== -1) {
      this._selectionDepots.splice(index, 1)
    }
  }

  // @VuexMutation public setSelectionClientLog (s: string) { this._selectionClientLog = s }
  @VuexMutation public setSelectionClients (s: Array<string>) { this._selectionClients = s }
  @VuexMutation public pushToSelectionClients (s: string) {
    const index = this._selectionClients.indexOf(s)
    if (index === -1) {
      this._selectionClients.push(s)
    }
  }

  @VuexMutation public delFromSelectionClients (s: string) {
    const index = this._selectionClients.indexOf(s)
    if (index !== -1) {
      this._selectionClients.splice(index, 1)
    }
  }

  @VuexMutation public setSelectionProducts (s: Array<string>) { this._selectionProducts = s }
  @VuexMutation public pushToSelectionProducts (s: string) {
    const index = this._selectionProducts.indexOf(s)
    if (index === -1) {
      this._selectionProducts.push(s)
    }
  }

  @VuexMutation public delFromSelectionProducts (s: string) {
    const index = this._selectionProducts.indexOf(s)
    if (index !== -1) {
      this._selectionProducts.splice(index, 1)
    }
  }

  @VuexMutation public clearAllSelection () {
    this._selectionDepots = []
    this._selectionClients = []
    this._selectionProducts = []
  }
}
