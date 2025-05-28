/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
export const useNavigate = () => {
  const storeTS = storeTablesettings()
  const { secondColumnSelectedRowId } = storeToRefs(storeTS)

  const route = useRoute()
  const _routeId = route.params.id || ['']
  const _routeLength = _routeId.length
  const rowactionConfigChecked = ref<any>({
    [_routeId[_routeLength - 1]]: true,
  })
  watch(() => route.params.id, changeSelectedSetting, { deep: true })
  changeSelectedSetting()
  function changeSelectedSetting() {
    let id: string = ''
    if (Array.isArray(route.params.id)) {
      id = route.params.id[route.params.id.length - 1]
    } else {
      id = route.params.id
    }

    Object.keys(rowactionConfigChecked.value).forEach(
      (k) => (rowactionConfigChecked.value[k] = false)
    )
    rowactionConfigChecked.value[id] = true
  }
  const pageType = computed(() => {
    return route.params.pagetype || ''
  })

  function toConfiguration(
    type: string,
    id: string,
    isChild: boolean = false,
    productType = 'LocalbootProduct'
  ) {
    if (type === 'clients') {
      storeTS.setSecondColumnSelectedRowId(id)
      useRouter().push(`/clients/${id}/config/`)
    } else if (type === 'servers') {
      storeTS.setSecondColumnSelectedRowId(id)
      useRouter().push(`/servers/${id}/config/`)
    } else if (type === 'products') {
      storeTS.setSecondColumnSelectedRowId(id)
      if (isChild) {
        useRouter().push(`/clients/products/${productType}/config/${id}`)
      } else {
        useRouter().push(`/products/${productType}/config/${id}`)
      }
    }
  }
  function toType(type: string, id: string, pagetype: string = 'config') {
    if (type === 'clients') {
      storeTS.setSecondColumnSelectedRowId(id)
      useRouter().push(`/clients/${id}/${pagetype}/`)
    } else if (type === 'servers') {
      storeTS.setSecondColumnSelectedRowId(id)
      useRouter().push(`/servers/${id}/${pagetype}/`)
    }
  }
  return {
    pageType,
    rowactionConfigChecked,
    secondColumnSelectedRowId,
    toType,
    toConfiguration,
  }
}
