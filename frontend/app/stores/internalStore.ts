/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { defineStore } from 'pinia'

export const useInternalStore = defineStore('internal', {
  state: () => ({
    splitviewClient: true,
    splitviewServer: true,
    productActionRequest: {} as Record<string, string>,
    productsLastRequestUrl: '',
    productsLastRequestParams: {} as any,
    productsLastRequestTime: 0,
  }),
})
