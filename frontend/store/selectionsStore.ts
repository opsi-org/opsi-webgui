import { defineStore } from 'pinia'
import { computed } from 'vue'


export const storeSelections = defineStore('selections', () => {
  // need to return the states / getters/ actions in the end of the setup
  // states
  let _multiSelection: boolean = useCookie('MultiSelection').value === 'true' || (useCookie('MultiSelection').value === undefined) || true
  let _selectionDepots: Array<string> = []
  let _selectionClients: Array<string> = []
  let _selectionProducts: Array<string> = []

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

  function clearAllSelection () {
    _selectionDepots = []
    _selectionClients = []
    _selectionProducts = []
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
                    setSelectionClients,
                    pushToSelectionClients,
                    delFromSelectionClients,
                    setSelectionProducts,
                    pushToSelectionProducts,
                    delFromSelectionProducts,
                    clearAllSelection
  }
}, { persist: true } as any)
