/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', {
  state: () => ({
    actions: {} as Record<string, Record<string, boolean>>,
  }),
  getters: {
    anyLoading: (state) =>
      Object.values(state.actions).some((action) => Object.values(action).some(Boolean)),
  },
  actions: {
    setLoading(action: string, id: string, value: boolean) {
      if (!this.actions[action]) this.actions[action] = {}
      this.actions[action][id] = value
    },
    setLoadingMany(action: string, ids: string[], value: boolean) {
      if (!this.actions[action]) this.actions[action] = {}
      ids.forEach((id) => {
        this.actions[action][id] = value
      })
    },
  },
})
