import { defineStore } from 'pinia'

export const storeInternalSettings = defineStore('settingsInternal', {
  // persist: false,
  //   persist: {
  //     key: 'opsi-auth',
  //     storage: localStorage,
  //     // storage: sessionStorage,
  //   },
  state: () => ({
    splitviewVisibilityClienttable: true,
  }),
  getters: {
    // quicksave: (state: any) => state._quicksave,
  },
  actions: {
    // setQuicksave(isQuickSave: boolean) {
    //   this.quicksave = isQuickSave
    //   useCookie('Quicksave').value = isQuickSave ? 'true' : 'false'
    // },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeSettings, import.meta.hot))
}
