/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineStore } from 'pinia'
import type { IObjectString2Boolean } from '@/types/tgeneral'
import type { T_DisaledFeatures, T_configuration, T_configurationResult } from '@/types/APItypes'
import { useNotification } from '~/composables/mixins/useComponent'

export const storeConfigapp = defineStore('config-app', {
  persist: {
    key: 'opsi-configs',
    storage: localStorage,
  },
  state: () => ({
    _config: undefined as T_configurationResult | undefined,
  }),
  getters: {
    config: ({ _config }) => _config,
  },
  actions: {
    setConfig(obj: T_configurationResult) {
      this._config = obj
    },

    async initConfig() {
      const { notifyError } = useNotification()
      const $t = useI18n().t

      const result = await useApiGET<T_configuration>('/user/configuration')
      if (result.error) {
        console.error(result.error)
        notifyError({ title: $t('message.fetchingFailed'), message: result.error })
        return
      } else if (!result.data.value) {
        console.error('No data in response')
        notifyError({
          title: $t('message.fetchingFailed'),
          message: $t('message.noResponse'),
        })
        return
      }
      const forbidden = await useApiGET<T_DisaledFeatures>('/opsidata/server/disabled-features')
      if (forbidden.error) {
        console.error(forbidden.error)
        notifyError({
          title: $t('message.fetchingFailed'),
          message: forbidden.error,
        })
        return
      } else if (!forbidden.data.value) {
        console.error('No data in response')
        notifyError({
          title: $t('message.fetchingFailed'),
          message: $t('message.noResponse'),
        })
        return
      }

      const _config: T_configurationResult = {
        ...result.data.value.configuration,
      }
      forbidden.data.value.forEach((forbElem: string) => {
        _config[forbElem + '.forbidden'] = true
      })
      this.setConfig(_config)
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeConfigapp, import.meta.hot))
}
