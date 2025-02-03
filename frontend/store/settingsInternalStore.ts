/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineStore } from 'pinia'

export const storeInternalSettings = defineStore('settingsInternal', {
  state: () => ({
    splitviewVisibilityClienttable: true,
    splitviewVisibilityServertable: true,
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
