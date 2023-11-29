import { defineStore } from 'pinia'
import { computed } from 'vue'


export const storeSelections = defineStore('selections', () => {
  // need to return the states / getters/ actions in the end of the setup
  // states
  let _multiSelection: boolean = useCookie('MultiSelection').value === 'true' || (useCookie('MultiSelection').value === undefined) || true
  let _selectionDepots: Array<string> = reactive([])
  let _selectionClients: Array<string> = reactive([])
  let _selectionProducts: Array<string> = reactive([])

  let _selectionLogClient: string = ''
  let _selectionLogType: string = 'instlog'
  let _selectionLogLevel: number = 5

  // getter
  const multiSelection = computed(() => _multiSelection)
  const selectionDepots = computed(() => _selectionDepots)
  const selectionClients = computed(() => _selectionClients)
  const selectionProducts = computed(() => _selectionProducts)
  const XselectionLogClient = computed(() => _selectionLogClient)
  const XselectionLogType = computed(() => _selectionLogType)
  const XselectionLogLevel = computed(() => _selectionLogLevel)

  // actions

  function setMultiSelection (isMultiSelection: boolean) {
    _multiSelection = isMultiSelection
    // Cookies.options.methods.setCookie('MultiSelection', (isMultiSelection) ? 'true' : 'false')
    useCookie('MultiSelection').value = (isMultiSelection) ? 'true' : 'false'
  }

  function XsetSelectionLogClient (s: string) { _selectionLogClient = s }
  function XsetSelectionLogType (s: string) { _selectionLogType = s }
  function XsetSelectionLogLevel (s: number) { _selectionLogLevel = s }

  function setSelectionDepots (s: Array<string>) {
    if (_multiSelection === false && s.length > 1) {
      _selectionDepots = [s[s.length - 1]]
    } else {
      _selectionDepots = s
    }
  }

  function pushToSelectionDepots (s: string) {
    const index = _selectionDepots.indexOf(s)
    if (index === -1) {
      if (_multiSelection === false) {
        _selectionDepots = [s]
      } else {
        _selectionDepots.push(s)
      }
    }
  }

  function delFromSelectionDepots (s: string) {
    const index = _selectionDepots.indexOf(s)
    if (index !== -1) {
      _selectionDepots.splice(index, 1)
    }
  }

  function setSelectionClients (s: Array<string>) {
    if (_multiSelection === false && s.length > 1) {
      _selectionClients = [s[s.length - 1]]
    } else {
      _selectionClients = s
    }
  }

  function pushToSelectionClients (s: string) {
    const index = _selectionClients.indexOf(s)
    if (index === -1) {
      // _selectionClients.push(s)
      if (_multiSelection === false) {
        _selectionClients = [s]
      } else {
        _selectionClients.push(s)
      }
    }
  }

  function delFromSelectionClients (s: string) {
    const index = _selectionClients.indexOf(s)
    if (index !== -1) {
      _selectionClients.splice(index, 1)
    }
  }

  function setSelectionProducts (s: Array<string>) {
    if (_multiSelection === false && s.length > 1) {
      _selectionProducts = [s[s.length - 1]]
    } else {
      _selectionProducts = s
    }
  }

  function pushToSelectionProducts (s: string) {
    const index = _selectionProducts.indexOf(s)
    if (index === -1) {
      if (_multiSelection === false) {
        _selectionProducts = [s]
      } else {
        _selectionProducts.push(s)
      }
    }
  }

  function delFromSelectionProducts (s: string) {
    const index = _selectionProducts.indexOf(s)
    if (index !== -1) {
      _selectionProducts.splice(index, 1)
    }
  }
  function toggleSelectionDepots (item: string) {
    toggleSelectionValue(_selectionDepots, item)
  }
  function toggleSelectionClients (item: string) {
    toggleSelectionValue(_selectionClients, item)
  }
  function toggleSelectionProducts (item: string) {
    toggleSelectionValue(_selectionProducts, item)
  }
  function toggleSelectionValue (selection: Array<string>, item: string){
    if(!selection.includes(item)){
      selection.push(item);
    }else{
      selection.splice(selection.indexOf(item), 1);  //deleting
    }
  }
  function clearSelectionDepots () {
    _selectionDepots.length = 0
  }
  function clearSelectionClients () {
    _selectionClients.length = 0
  }
  function clearSelectionProducts () {
    _selectionProducts.length = 0
  }
  function clearAllSelection () {
    clearSelectionDepots()
    clearSelectionClients()
    clearSelectionProducts()
  }
  return {
    /* states */
    /* getters */ multiSelection,
                  selectionDepots,
                  selectionClients,
                  selectionProducts,
                  XselectionLogClient,
                  XselectionLogType,
                  XselectionLogLevel
    /* actions */ , setMultiSelection,
                    XsetSelectionLogClient,
                    XsetSelectionLogType,
                    XsetSelectionLogLevel,
                    setSelectionDepots,
                    pushToSelectionDepots,
                    delFromSelectionDepots,
                    toggleSelectionDepots,
                    setSelectionClients,
                    pushToSelectionClients,
                    delFromSelectionClients,
                    toggleSelectionClients,
                    setSelectionProducts,
                    pushToSelectionProducts,
                    delFromSelectionProducts,
                    toggleSelectionProducts,
                    toggleSelectionValue,
                    clearSelectionDepots,
                    clearSelectionClients,
                    clearSelectionProducts,
                    clearAllSelection
  }
}, { persist: true } as any)
