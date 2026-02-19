/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeTablesettings } from '~/app/stores/tablesettings'
import { storeToRefs } from 'pinia'

export interface PageSettings {
  page0Condition: boolean
  page1Condition: boolean
  width: string | undefined
}

export function usePageHelper() {
  // Navigation
  const storeTS = storeTablesettings()
  const { secondColumnSelectedRowId } = storeToRefs(storeTS)
  const route = useRoute()
  const router = useRouter()

  const routeId = computed(() =>
    Array.isArray(route.params.id) ? route.params.id : [route.params.id || '']
  )
  const rowactionConfigChecked = ref<Record<string, boolean>>({
    [routeId.value.at(-1) ?? '']: true,
  })

  function changeSelectedSetting() {
    const id = routeId.value.at(-1) ?? ''
    Object.keys(rowactionConfigChecked.value).forEach(
      (k) => (rowactionConfigChecked.value[k] = false)
    )
    rowactionConfigChecked.value[id] = true
  }

  watch(() => route.params.id, changeSelectedSetting, { deep: true })
  changeSelectedSetting()

  const pageType = computed(() => route.params.pagetype || '')

  function navigateToConfig(
    type: string,
    id: string,
    isChild = false,
    productType = 'LocalbootProduct'
  ) {
    storeTS.setSecondColumnSelectedRowId(id)
    if (type === 'clients') {
      router.push(`/clients/${id}/config/`)
    } else if (type === 'servers') {
      router.push(`/servers/${id}/config/`)
    } else if (type === 'products') {
      router.push(
        isChild
          ? `/clients/products/${productType}/config/${id}`
          : `/products/${productType}/config/${id}`
      )
    }
  }

  function navigateToType(type: string, id: string, pagetype = 'config') {
    storeTS.setSecondColumnSelectedRowId(id)
    if (type === 'clients') {
      router.push(`/clients/${id}/${pagetype}/`)
    } else if (type === 'servers') {
      router.push(`/servers/${id}/${pagetype}/`)
    }
  }

  // Page settings
  const path = computed(() =>
    useRoute()
      .path.split('/')
      .filter((p) => p !== '')
  )

  const serverSettings: Record<string, PageSettings> = {
    servers: { page0Condition: true, page1Condition: false, width: '100%' },
    'servers-config': { page0Condition: false, page1Condition: true, width: '100%' },
    'servers-config-id': { page0Condition: false, page1Condition: true, width: '100%' },
    'servers-id-pagetype': { page0Condition: true, page1Condition: true, width: undefined },
  }

  const clientSettings: Record<string, PageSettings> = {
    clients: { page0Condition: true, page1Condition: false, width: '100%' },
    'clients-config': { page0Condition: false, page1Condition: true, width: '100%' },
    'clients-config-id': { page0Condition: false, page1Condition: true, width: '100%' },
    'clients-create': { page0Condition: false, page1Condition: true, width: '100%' },
    'clients-clone': { page0Condition: false, page1Condition: true, width: '100%' },
    'clients-logs-id': { page0Condition: false, page1Condition: true, width: '100%' },
    'clients-clone-id': { page0Condition: false, page1Condition: true, width: '100%' },
    'clients-id-pagetype': { page0Condition: true, page1Condition: true, width: '50%' },
    'clients-products-producttype': {
      page0Condition: true,
      page1Condition: true,
      width: undefined,
    },
    'clients-products-producttype-pagetype-id': {
      page0Condition: true,
      page1Condition: true,
      width: undefined,
    },
  }

  const productSettings: Record<string, PageSettings> = {
    'products-producttype': { page0Condition: true, page1Condition: false, width: '100%' },
    'products-producttype-pagetype-id': {
      page0Condition: true,
      page1Condition: true,
      width: '50%',
    },
  }

  return {
    // Navigation
    pageType,
    rowactionConfigChecked,
    secondColumnSelectedRowId,
    navigateToType,
    navigateToConfig,
    // Page settings
    serverSettings,
    clientSettings,
    productSettings,
    path,
  }
}
