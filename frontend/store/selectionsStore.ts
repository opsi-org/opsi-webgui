import { defineStore } from 'pinia'
// import { computed } from 'vue'

export const storeSelections = defineStore('selections', {
  // persist: false,
  persist: {
    key: 'opsi-selections',
    storage: localStorage,
    // storage: sessionStorage,
  },
  state: () => ({
    // _multiSelection: useCookie('MultiSelection', { default: () => false }),
    // _multiSelection: (useCookie('MultiSelection').value === 'true' || (useCookie('MultiSelection').value === undefined) || true) as boolean,
    _selectionDepots: reactive( (localStorage.getItem('selectionDepots') ? JSON.parse(localStorage.getItem('selectionDepots') as string) : []) as Array<string>),
    _selectionClients: reactive([] as Array<string>),
    _selectionProducts: reactive([] as Array<string>),
    _selectionLogClient: '',
    _selectionLogType: 'instlog',
    _selectionLogLevel: 5
  }),
  getters: {
    // multiSelection: (state: any) => state._multiSelection,
    multiSelection: (state: any) => useCookie('MultiSelection', { default: () => false }).value,
    selectionDepots: (state: any) => state._selectionDepots,
    selectionClients: (state: any) => state._selectionClients,
    selectionProducts: (state: any) => state._selectionProducts,
    selectionLogClient: (state: any) => state._selectionLogClient,
    selectionLogType: (state: any) => state._selectionLogType,
    selectionLogLevel: (state: any) => state._selectionLogLevel
  },
  actions: {
    setMultiSelection (isMultiSelection: boolean) {
      // this._multiSelection = isMultiSelection
      // Cookies.options.methods.setCookie('MultiSelection', (isMultiSelection) ? 'true' : 'false')
      useCookie('MultiSelection').value = (isMultiSelection) ? 'true' : 'false'
    },
    XsetSelectionLogClient (s: string) { this._selectionLogClient = s },
    XsetSelectionLogType (s: string) { this._selectionLogType = s },
    XsetSelectionLogLevel (s: number) { this._selectionLogLevel = s },
    setSelectionDepots (s: Array<string>) {
      if (this.multiSelection === false && s.length > 1) {
        this._selectionDepots = reactive([s[s.length - 1]])
      } else {
        this._selectionDepots = reactive([...s])
      }
    },

    pushToSelectionDepots (s: string) {
      const index = this._selectionDepots.indexOf(s)
      if (index === -1) {
        if (this.multiSelection === false) {
          this._selectionDepots = [s]
        } else {
          this._selectionDepots.push(s)
        }
      }
    },

    delFromSelectionDepots (s: string) {
      const index = this._selectionDepots.indexOf(s)
      if (index !== -1) {
        this._selectionDepots.splice(index, 1)
      }
    },

    setSelectionClients (s: Array<string>) {
      if (this.multiSelection === false && s.length > 1) {
        this._selectionClients = [s[s.length - 1]]
      } else {
        this._selectionClients = s
      }
    },

    pushToSelectionClients (s: string) {
      const index = this._selectionClients.indexOf(s)
      if (index === -1) {
        // _selectionClients.push(s)
        if (this.multiSelection === false) {
          this._selectionClients = [s]
        } else {
          this._selectionClients.push(s)
        }
      }
    },

    delFromSelectionClients (s: string) {
      const index = this._selectionClients.indexOf(s)
      if (index !== -1) {
        this._selectionClients.splice(index, 1)
      }
    },

    setSelectionProducts (s: Array<string>) {
      if (this.multiSelection === false && s.length > 1) {
        this._selectionProducts = [s[s.length - 1]]
      } else {
        this._selectionProducts = s
      }
    },

    pushToSelectionProducts (s: string) {
      const index = this._selectionProducts.indexOf(s)
      if (index === -1) {
        if (this.multiSelection === false) {
          this._selectionProducts = [s]
        } else {
          this._selectionProducts.push(s)
        }
      }
    },

    delFromSelectionProducts (s: string) {
      const index = this._selectionProducts.indexOf(s)
      if (index !== -1) {
        this._selectionProducts.splice(index, 1)
      }
    },
    toggleSelectionDepots (item: string, checkMulti: Boolean = true) {
      if (checkMulti)
      this.toggleSelectionValueAndCheck(this._selectionDepots, item)
      else this.toggleSelectionValue(this._selectionDepots, item)
    },
    toggleSelectionClients (item: string, checkMulti: Boolean = true) {
      if (checkMulti)
      this.toggleSelectionValueAndCheck(this._selectionClients, item)
      else this.toggleSelectionValue(this._selectionClients, item)
    },
    toggleSelectionProducts (item: string, checkMulti: Boolean = true) {
      if (checkMulti)
      this.toggleSelectionValueAndCheck(this._selectionProducts, item)
      else this.toggleSelectionValue(this._selectionProducts, item)
    },
    toggleSelectionValue (selection: Array<string>, item: string){
      if(!selection.includes(item)){
        selection.push(item);
      }else{
        selection.splice(selection.indexOf(item), 1);  //deleting
      }
    },
    toggleSelectionValueAndCheck(selection: Array<string>, item: string) {
      if(!selection.includes(item)){
        if (!this.multiSelection) selection.length = 0
        selection.push(item);
      } else {
        if (!this.multiSelection) selection.length = 0
        selection.splice(selection.indexOf(item), 1);  //deleting
      }
    },
    clearSelectionDepots () {
      this._selectionDepots.length = 0
    },
    clearSelectionClients () {
      this._selectionClients.length = 0
    },
    clearSelectionProducts () {
      this._selectionProducts.length = 0
    },
    clearAllSelection () {
      this.clearSelectionDepots()
      this.clearSelectionClients()
      this.clearSelectionProducts()
    }
  },
})


if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeSelections, import.meta.hot));
}

// export const storeSelections = defineStore('selections', () => {
//   // need to return the states / getters/ actions in the end of the setup
//     // states
//   let _multiSelection: boolean = useCookie('MultiSelection').value === 'true' || (useCookie('MultiSelection').value === undefined) || true
//   let _selectionDepots: Array<string> = reactive( localStorage.getItem('selectionDepots') ? JSON.parse(localStorage.getItem('selectionDepots') as string) : [])
//   let _selectionClients: Array<string> = reactive([])
//   let _selectionProducts: Array<string> = reactive([])

//   let _selectionLogClient: string = ''
//   let _selectionLogType: string = 'instlog'
//   let _selectionLogLevel: number = 5

//   // getter
//   const multiSelection = computed(() => _multiSelection)
//   const selectionDepots = computed(() => _selectionDepots)
//   const selectionClients = computed(() => _selectionClients)
//   const selectionProducts = computed(() => _selectionProducts)
//   const XselectionLogClient = computed(() => _selectionLogClient)
//   const XselectionLogType = computed(() => _selectionLogType)
//   const XselectionLogLevel = computed(() => _selectionLogLevel)

//   watch(selectionDepots, (newVal, oldVal) => {
//     localStorage.setItem('selectionDepots', JSON.stringify(newVal))
//   })
//   // actions

//   function setMultiSelection (isMultiSelection: boolean) {
//     _multiSelection = isMultiSelection
//     // Cookies.options.methods.setCookie('MultiSelection', (isMultiSelection) ? 'true' : 'false')
//     useCookie('MultiSelection').value = (isMultiSelection) ? 'true' : 'false'
//   }

//   function XsetSelectionLogClient (s: string) { _selectionLogClient = s }
//   function XsetSelectionLogType (s: string) { _selectionLogType = s }
//   function XsetSelectionLogLevel (s: number) { _selectionLogLevel = s }

//   function setSelectionDepots (s: Array<string>) {
//     if (_multiSelection === false && s.length > 1) {
//       _selectionDepots = reactive([s[s.length - 1]])
//     } else {
//       _selectionDepots = reactive([...s])
//     }
//   }

//   function pushToSelectionDepots (s: string) {
//     const index = _selectionDepots.indexOf(s)
//     if (index === -1) {
//       if (_multiSelection === false) {
//         _selectionDepots = [s]
//       } else {
//         _selectionDepots.push(s)
//       }
//     }
//   }

//   function delFromSelectionDepots (s: string) {
//     const index = _selectionDepots.indexOf(s)
//     if (index !== -1) {
//       _selectionDepots.splice(index, 1)
//     }
//   }

//   function setSelectionClients (s: Array<string>) {
//     if (_multiSelection === false && s.length > 1) {
//       _selectionClients = [s[s.length - 1]]
//     } else {
//       _selectionClients = s
//     }
//   }

//   function pushToSelectionClients (s: string) {
//     const index = _selectionClients.indexOf(s)
//     if (index === -1) {
//       // _selectionClients.push(s)
//       if (_multiSelection === false) {
//         _selectionClients = [s]
//       } else {
//         _selectionClients.push(s)
//       }
//     }
//   }

//   function delFromSelectionClients (s: string) {
//     const index = _selectionClients.indexOf(s)
//     if (index !== -1) {
//       _selectionClients.splice(index, 1)
//     }
//   }

//   function setSelectionProducts (s: Array<string>) {
//     if (_multiSelection === false && s.length > 1) {
//       _selectionProducts = [s[s.length - 1]]
//     } else {
//       _selectionProducts = s
//     }
//   }

//   function pushToSelectionProducts (s: string) {
//     const index = _selectionProducts.indexOf(s)
//     if (index === -1) {
//       if (_multiSelection === false) {
//         _selectionProducts = [s]
//       } else {
//         _selectionProducts.push(s)
//       }
//     }
//   }

//   function delFromSelectionProducts (s: string) {
//     const index = _selectionProducts.indexOf(s)
//     if (index !== -1) {
//       _selectionProducts.splice(index, 1)
//     }
//   }
//   function toggleSelectionDepots (item: string) {
//     toggleSelectionValue(_selectionDepots, item)
//   }
//   function toggleSelectionClients (item: string) {
//     toggleSelectionValue(_selectionClients, item)
//   }
//   function toggleSelectionProducts (item: string) {
//     toggleSelectionValue(_selectionProducts, item)
//   }
//   function toggleSelectionValue (selection: Array<string>, item: string){
//     if(!selection.includes(item)){
//       selection.push(item);
//     }else{
//       selection.splice(selection.indexOf(item), 1);  //deleting
//     }
//   }
//   function clearSelectionDepots () {
//     _selectionDepots.length = 0
//   }
//   function clearSelectionClients () {
//     _selectionClients.length = 0
//   }
//   function clearSelectionProducts () {
//     _selectionProducts.length = 0
//   }
//   function clearAllSelection () {
//     clearSelectionDepots()
//     clearSelectionClients()
//     clearSelectionProducts()
//   }
//   return {
//     /* states */
//     /* getters */ multiSelection,
//                   selectionDepots,
//                   selectionClients,
//                   selectionProducts,
//                   XselectionLogClient,
//                   XselectionLogType,
//                   XselectionLogLevel
//     /* actions */ , setMultiSelection,
//                     XsetSelectionLogClient,
//                     XsetSelectionLogType,
//                     XsetSelectionLogLevel,
//                     setSelectionDepots,
//                     pushToSelectionDepots,
//                     delFromSelectionDepots,
//                     toggleSelectionDepots,
//                     setSelectionClients,
//                     pushToSelectionClients,
//                     delFromSelectionClients,
//                     toggleSelectionClients,
//                     setSelectionProducts,
//                     pushToSelectionProducts,
//                     delFromSelectionProducts,
//                     toggleSelectionProducts,
//                     toggleSelectionValue,
//                     clearSelectionDepots,
//                     clearSelectionClients,
//                     clearSelectionProducts,
//                     clearAllSelection
//   }
// }, { persist: {
//   storage: persistedState.localStorage,
// }, } as any)
// }, { persist: true } as any)
