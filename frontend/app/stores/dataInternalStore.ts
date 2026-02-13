/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineStore } from 'pinia'

export const storeInternalData = defineStore('settingsData', {
  state: () => ({
    productActionRequest: {} as Record<string, string>,
    productsLastRequestUrl: '',
    productsLastRequestParams: {} as any,
    productsLastRequestTime: 0,
  }),
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeSettings, import.meta.hot))
}
