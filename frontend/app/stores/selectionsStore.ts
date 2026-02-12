/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineStore } from 'pinia'

export const storeSelections = defineStore('selections', {
  persist: {
    key: 'opsi-selections',
    storage: localStorage,
  },
  state: () => ({
    _selectionDepotsDefault: ['<configserver>'],
    _selectionDepots: reactive(
      (localStorage.getItem('selectionDepots')
        ? JSON.parse(localStorage.getItem('selectionDepots') as string)
        : []) as string[]
    ),
    _selectionClients: reactive([] as Array<string>),
    _selectionProducts: reactive([] as Array<string>),
    _selectionLogClient: '',
    _selectionLogType: 'instlog',
    _selectionLogLevel: 5,
  }),
  getters: {
    multiSelection: () => useCookie('MultiSelection', { default: () => true }).value,
    selectionDefaultDepots: (state: any): Array<string> => state._selectionDepotsDefault, // default depots for depotSelection modal
    selectionDepots: (state: any): Array<string> => state._selectionDepots,
    selectionClients: (state: any): Array<string> => state._selectionClients,
    selectionProducts: (state: any): Array<string> => state._selectionProducts,
    selectionLogClient: (state: any): string => state._selectionLogClient,
    selectionLogType: (state: any): string => state._selectionLogType,
    selectionLogLevel: (state: any): number => state._selectionLogLevel,
  },
  actions: {
    setMultiSelection(isMultiSelection: boolean) {
      useCookie('MultiSelection').value = isMultiSelection ? 'true' : 'false'
    },
    XsetSelectionLogClient(s: string) {
      this._selectionLogClient = s
    },
    XsetSelectionLogType(s: string) {
      this._selectionLogType = s
    },
    XsetSelectionLogLevel(s: number) {
      this._selectionLogLevel = s
    },
    setSelectionDepotsDefault(s: Array<string>) {
      this._selectionDepotsDefault = s
    },
    setSelectionDepots(s: Array<string>) {
      if (this.multiSelection === false && s.length > 1) {
        if (s?.length === 0 || s[s.length - 1] === undefined) {
          this._selectionDepots = reactive([])
          return
        }
        this._selectionDepots = reactive([s[s.length - 1]] as string[])
      } else {
        this._selectionDepots = reactive([...s])
      }
    },

    pushToSelectionDepots(s: string) {
      const index = this._selectionDepots.indexOf(s)
      if (index === -1) {
        if (this.multiSelection === false) {
          this._selectionDepots = [s]
        } else {
          this._selectionDepots.push(s)
        }
      }
    },

    delFromSelectionDepots(s: string) {
      const index = this._selectionDepots.indexOf(s)
      if (index !== -1) {
        this._selectionDepots.splice(index, 1)
      }
    },

    setSelectionClients(s: Array<string>) {
      if (this.multiSelection === false && s.length > 1) {
        this._selectionClients = [s[s.length - 1] as string]
      } else {
        this._selectionClients = s
      }
    },

    pushToSelectionClients(s: string) {
      const index = this._selectionClients.indexOf(s)
      if (index === -1) {
        if (this.multiSelection === false) {
          this._selectionClients = [s]
        } else {
          this._selectionClients.push(s)
        }
      }
    },

    delFromSelectionClients(s: string) {
      const index = this._selectionClients.indexOf(s)
      if (index !== -1) {
        this._selectionClients.splice(index, 1)
      }
    },

    setSelectionProducts(s: Array<string>) {
      if (this.multiSelection === false && s.length > 1) {
        if (s?.length === 0) {
          this._selectionProducts = []
          return
        }

        this._selectionProducts = [s[s.length - 1] as string]
      } else {
        this._selectionProducts = s
      }
    },

    pushToSelectionProducts(s: string) {
      const index = this._selectionProducts.indexOf(s)
      if (index === -1) {
        if (this.multiSelection === false) {
          this._selectionProducts = [s]
        } else {
          this._selectionProducts.push(s)
        }
      }
    },

    delFromSelectionProducts(s: string) {
      const index = this._selectionProducts.indexOf(s)
      if (index !== -1) {
        this._selectionProducts.splice(index, 1)
      }
    },
    toggleSelectionDepots(item: string, checkMulti: boolean = true) {
      if (checkMulti) this.toggleSelectionValueAndCheck(this._selectionDepots, item)
      else this.toggleSelectionValue(this._selectionDepots, item)
    },
    toggleSelectionClients(item: string, checkMulti: boolean = true) {
      if (checkMulti) this.toggleSelectionValueAndCheck(this._selectionClients, item)
      else this.toggleSelectionValue(this._selectionClients, item)
    },
    toggleSelectionProducts(item: string, checkMulti: boolean = true) {
      if (checkMulti) this.toggleSelectionValueAndCheck(this._selectionProducts, item)
      else this.toggleSelectionValue(this._selectionProducts, item)
    },
    toggleSelectionValue(selection: Array<string>, item: string) {
      if (!selection.includes(item)) {
        selection.push(item)
      } else {
        selection.splice(selection.indexOf(item), 1) //deleting
      }
    },
    toggleSelectionValueAndCheck(selection: Array<string>, item: string) {
      if (!selection.includes(item)) {
        if (!this.multiSelection) selection.length = 0
        selection.push(item)
      } else {
        if (!this.multiSelection) selection.length = 0
        selection.splice(selection.indexOf(item), 1) //deleting
      }
    },
    clearSelectionDepots() {
      this._selectionDepots.length = 0
    },
    clearSelectionClients() {
      this._selectionClients.length = 0
    },
    clearSelectionProducts() {
      this._selectionProducts.length = 0
    },
    clearAllSelection() {
      this.clearSelectionDepots()
      this.clearSelectionClients()
      this.clearSelectionProducts()
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeSelections, import.meta.hot))
}
