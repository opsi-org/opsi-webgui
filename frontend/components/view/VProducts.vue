<template>
  <TableTTable
    ref="productsRef"
    :is-mobile="isMobile"
    :row-id="rowId"
    :table-column="tableColumn"
    :fetch="fetchProducts"
    :sort-by="props.sortby"
    body-height="64vh"
    :action-config="(rowData: any) => `/products/${currentType}/config/${rowData[rowId]}`"
    @selection-changed="(id: string) => {storeSelection.toggleSelectionProducts(id)}"
    @clear-selection="storeSelection.clearSelectionProducts"
  >
    <template #toolbar-right>
      <el-button
        :type="hasUnsavedChanges ? 'success' : ''"
        :disabled="!hasUnsavedChanges"
        @click="saveBufferedChanges"
      >
        {{ $t('button.save') }}
      </el-button>
    </template>
    <template #header>
      <div>
        <el-checkbox-button
          v-model="productsTypeChecked.LocalbootProduct"
          @change="changeProductsType('LocalbootProduct')"
          >{{ $t('title.localbootProducts') }}</el-checkbox-button
        >
        <el-checkbox-button
          v-model="productsTypeChecked.NetbootProduct"
          @change="changeProductsType('NetbootProduct')"
          >{{ $t('title.netbootProducts') }}</el-checkbox-button
        >
        <el-alert
          v-if="props.selectedClient"
          :title="
            $t('table.info.productsOnClient', { id: props.selectedClient })
          "
          type="warning"
          show-icon
          :closable="false"
          class="max-w-80 !inline-flex !relative max-h-8"
        />
      </div>
    </template>
  </TableTTable>
</template>

<script setup lang="tsx">
  import type { IProductTypes, T_Client2Depot } from '~/types/APItypes'
  import { useIcons } from '../../composables/mixins/useIcons'
  import { useNotification } from '~/composables/mixins/useComponent'
  import { useNavigate } from '~/composables/mixins/useNavigateTo'
  import { useSaveProductActionRequest } from '~/composables/mixins/useSave'
  import { useClient } from '~/composables/mixins/useGet'
  import { useMBus } from '~/composables/mixins/useMessagebus'
  import TCProductVersionCell from '~/components/tablecell/TCProductVersionCell.vue'
  import BTNRowLink from '~/components/button/BTNRowLink.vue'
  import Checkbox from 'primevue/checkbox'
  import RadioButton from 'primevue/radiobutton'
  import TCBadgeCompares from '../tablecell/TCBadgeCompares.vue'
  import TCProductRequest from '../tablecell/TCProductRequest.vue'

  const { notifyInfo, notifyError } = useNotification()
  const $t = useI18n().t
  const navigation = useNavigate()
  const icons = useIcons()
  const router = useRouter()
  const fetchClient = useClient()
  useMBus(wsBusMsgObjectChanged, false, $t)

  const storeSelection = storeSelections()
  const { msgbusAutoRefresh } = storeToRefs(storeSettings())

  const emit = defineEmits(['change'])
  const props = defineProps({
    isMobile: {
      type: Boolean,
      default: () => {
        return false
      },
    },
    productType: { type: String, default: 'LocalbootProduct' },
    isChild: { type: Boolean, default: false },
    sortby: { type: String, default: 'productId' },
    selectedClient: { type: String, default: undefined },
  })

  const id = 'products'
  const rowId = 'productId'
  // Refs
  const productsRef = ref()
  const { selectionDepots, selectionClients, selectionProducts } =
    storeToRefs(storeSelection)
  const clientSelection: Ref<Array<string>> = props.selectedClient
    ? ref([props.selectedClient])
    : selectionClients
  const fetchedDataClients2Depots = ref<T_Client2Depot>({})
  const lastChanges = ref({
    clientIds: [] as Array<string>,
    productIds: [] as Array<string>,
  }) // used to check if we caused the last event
  const productsTypeChecked = ref({
    LocalbootProduct: true,
    NetbootProduct: false,
    Product: false,
  })
  const currentType = computed<IProductTypes>(() => {
    if (productsTypeChecked.value.LocalbootProduct) return 'LocalbootProduct'
    if (productsTypeChecked.value.NetbootProduct) return 'NetbootProduct'
    if (productsTypeChecked.value.Product) return 'Product'
    return 'LocalbootProduct'
  })

  const tableColumn = ref([
    {
      title: '',
      key: 'selected',
      sortable: true,
      type: 'selection',
      visible: true,
      alwaysVisible: true,
      width: '60px',
      cellRenderer: ({ rowData }: any) => {
        if (!rowData?.[rowId]) return
        rowData.selected = storeSelection.selectionProducts.includes(
          rowData[rowId],
        )
        watch(
          () => storeSelection.selectionProducts,
          () => {
            rowData.selected = storeSelection.selectionProducts.includes(
              rowData[rowId],
            )
          },
        )
        return storeSelection.multiSelection ? (
          <Checkbox model-value={rowData.selected} binary readonly />
        ) : (
          <RadioButton
            model-value={rowData.selected}
            inputId={rowId + 'Selection-' + rowData[rowId]}
            name={rowId + 'selection'}
            value=""
            binary
            readonly
          />
        )
      },
    },
    {
      title: $t('table.fields.instStatus'),
      key: 'installationStatus',
      sortable: true,
      visible: clientSelection.value.length > 0,
      width: '80px',
      icon: icons.product,
      cellRenderer: ({ rowData }: any) => {
        return (
          <>
            {clientSelection.value.length > 0 ? (
              <TCBadgeCompares
                type="installationStatus"
                rowid={rowData.productId}
                values={
                  rowData.installationStatusDetails || [
                    rowData.installationStatus,
                  ] ||
                  []
                }
                objects={rowData.selectedClients || []}
                objectsorigin={clientSelection.value || []}
              />
            ) : (
              <div />
            )}
            {/* <el-text v-else>---</el-text> */}
          </>
        )
      },
    },
    {
      title: $t('table.fields.actionResult'),
      key: 'actionResult',
      sortable: true,
      visible: clientSelection.value.length > 0,
      width: '80px',
      icon: icons.productActionResult,
      cellRenderer: ({ rowData }: any) => {
        return (
          <>
            {/* v-if={clientSelection.value.length > 0} */}
            {clientSelection.value.length > 0 ? (
              <TCBadgeCompares
                type="actionResult"
                rowid={rowData.productId}
                values={
                  rowData.actionResultDetails || [rowData.actionResult] || []
                }
                objects={rowData.selectedClients || []}
                objectsorigin={clientSelection.value || []}
              />
            ) : (
              <div />
            )}
            {/* <el-text v-else>---</el-text> */}
          </>
        )
      },
    },

    {
      title: $t('table.fields.productId'),
      key: 'productId',
      sortable: true,
      alwaysVisible: true,
      visible: true,
      filter: true,
    },
    {
      title: $t('table.fields.description'),
      key: 'description',
      sortable: true,
      visible: false,
    },
    {
      title: $t('table.fields.advice'),
      key: 'advice',
      sortable: true,
      visible: false,
    },
    {
      title: $t('table.fields.modificationTime'),
      key: 'modificationTime',
      sortable: true,
      visible: false,
    },
    {
      title: $t('table.fields.priority'),
      key: 'priority',
      sortable: true,
      visible: false,
    },
    {
      title: $t('table.fields.version'),
      key: 'version',
      sortable: true,
      visible: true,
      cellRenderer: ({ rowData }: any) => {
        return (
          <TCProductVersionCell
            type="depotVersions"
            row={rowData}
            clients2depots={fetchedDataClients2Depots.value}
          />
        )
      },
    },
    {
      title: $t('table.fields.actionProgress'),
      key: 'actionProgress',
      sortable: true,
      visible: false, //clientSelection.value.length > 0,
    },
    {
      title: $t('table.fields.actionRequest'),
      key: 'actionRequest',
      sortable: true,
      visible: clientSelection.value.length > 0,
      headerCellRenderer: useMQ().isMobile.value
        ? undefined
        : () => {
            return (
              <TCProductRequest
                title={$t('form.tooltip.actionRequest')}
                save={saveActionRequests}
              />
            )
          },
      cellRenderer: ({ rowData }: any) => {
        return (
          <TCProductRequest
            modelValue={rowData}
            row-is-selected={selectionProducts.value.includes(
              rowData.productId,
            )}
            save={saveActionRequest}
          />
        )
      },
    },
    {
      title: $t('table.fields.rowactions'),
      key: 'actions',
      sortable: false,
      visible: true,
      alwaysVisible: true,
      width: '150px',
      cellRenderer: ({ rowData }: any) => {
        const change = () => {
          emit('change', rowData.productId)
          navigation.toConfiguration(
            id,
            rowData.productId,
            props.isChild,
            currentType.value,
          )
        }
        return (
          <div class="flex flex-row">
            <BTNRowLink
              is-pressed={
                navigation.rowactionConfigChecked.value[rowData.productId]
              }
              icon={icons.settings}
              onOnClick={change}
            />
          </div>
        )
      },
    },
  ])

  const bufferedChanges = ref<object>({})
  const hasUnsavedChanges = computed(
    () => Object.keys(bufferedChanges.value).length > 0,
  )

  onMounted(async () => {
    if (props.productType && props.productType !== currentType.value)
      changeProductsType(props.productType as IProductTypes)

    fetchedDataClients2Depots.value = await fetchClient.getClientToDepot(
      clientSelection.value,
    )
    productsRef.value?.refetch()
  })

  watch(
    () => props.selectedClient,
    (v) => {
      if (v) {
        clientSelection.value = [v]
      } else {
        clientSelection.value = selectionClients.value
      }
      productsRef.value?.refetch()
    },
  )

  async function fetchProducts(_params: any) {
    const params = prepareParams(_params)
    const { data, error, headers } = await useApiGETBody<Array<any>>(
      '/opsidata/products',
      params,
    )
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      return
    }
    if (data.value === undefined) {
      return []
    }
    if (headers === undefined) {
      return []
    }
    return {
      data: data.value,
      total: parseInt(headers.get('x-total-count') || '0'),
    }
  }

  async function wsBusMsgObjectChanged(msg: any = undefined) {
    if (
      msg &&
      [
        'event:productOnClient_created',
        'event:productOnClient_updated',
        'event:productOnClient_deleted',
      ].includes(msg.channel) &&
      msg.data.productType === currentType.value &&
      clientSelection.value.includes(msg.data.clientId)
    ) {
      if (
        !(
          lastChanges.value.clientIds.includes(msg.data.clientId) &&
          lastChanges.value.productIds.includes(msg.data.productId)
        )
      ) {
        if (msgbusAutoRefresh.value) {
          productsRef.value?.refetch()
          return
        }

        // check if we may cause the event...
        notifyInfo({
          title: $t('message.info.event'),
          message: $t('message.info.event.poc_updated', {
            productId: msg.data.productId,
          }),
          button: {
            label: $t('label.reloadPage'),
            onClick: productsRef.value?.refetch,
          },
        })
      }
    }
  }

  function prepareParams(params: any) {
    params.type = currentType.value
    params.selectedDepots = JSON.stringify(selectionDepots.value)
    params.selectedClients = JSON.stringify(clientSelection.value)
    if (params.sortBy === 'installationStatus') {
      params.sortBy = '["installationStatus", "installationStatusErrorLevel"]'
    } else if (params.sortBy === 'actionResult') {
      params.sortBy = '["actionResultErrorLevel", "actionResult"]'
    } else if (params.sortBy === 'depotVersions') {
      params.sortBy = 'depot_version_diff'
    } else if (params.sortBy === 'clientVersions') {
      params.sortBy = 'client_version_outdated'
    } else if (params.sortBy === 'desc') {
      params.sortBy = 'description'
    } else if (params.sortBy === '') {
      params.sortBy = 'productId'
    } else if (params.sortBy === 'version') {
      params.sortBy =
        '["client_version_outdated", "depot_version_diff", "not_on_all_depots", "clientVersions", "depotVersions"]'
    } else if (params.sortBy === 'selected') {
      params.sortDesc = true
      params.selected = JSON.stringify(selectionProducts)
    }
    return params
  }

  // async function saveActionRequests(rowItem: any, newrequest: string) {
  //   const data = {
  //     clientIds: clientSelection.value,
  //     productIds: selectionProducts.value,
  //     actionRequest: newrequest,
  //   }
  //   lastChanges.value.clientIds = data.clientIds
  //   lastChanges.value.productIds = data.productIds
  //   console.warn('saveActionRequests', storeSettings().quicksave)
  //   if (storeSettings().quicksave) {
  //     await useSaveProductActionRequest($t).saveProdActionRequest(
  //       data,
  //       null,
  //       true,
  //     )
  //     productsRef.value?.refetch()
  //   } else {
  //     for (const c in selectionClients.value) {
  //       const clientId = selectionClients.value[c]
  //       for (const p in selectionProducts.value) {
  //         const productId = selectionProducts.value[p]

  //         const d = {
  //           user: storeAuth().username,
  //           clientId: clientId,
  //           productId: productId,
  //           actionRequest: newrequest,
  //         }

  //         const objIndex = storeChanges().changesProducts.findIndex(
  //           (item) => item.clientId === c && item.productId === p,
  //         )
  //         if (objIndex > -1) {
  //           storeChanges().delWithIndexChangesProducts(objIndex)
  //         }
  //         storeChanges().pushToChangesProducts(d)
  //       }
  //     }
  //   }
  // }

  // async function saveActionRequest(rowitem: any, newrequest: string) {
  //   const data = {
  //     clientIds: clientSelection.value,
  //     productIds: [rowitem.productId],
  //     actionRequest: newrequest,
  //   }
  //   if (storeSettings().quicksave) {
  //     lastChanges.value.clientIds = data.clientIds
  //     lastChanges.value.productIds = data.productIds
  //     const ok = await useSaveProductActionRequest($t).saveProdActionRequest(
  //       data,
  //       null,
  //       true,
  //     )
  //     if (ok) {
  //       rowitem.actionRequest = newrequest
  //       rowitem.selectedClients = clientSelection.value
  //       delete rowitem.actionRequestDetails
  //     }
  //   } else {
  //     for (const c in clientSelection.value) {
  //       const clientId = selectionClients.value[c]
  //       const d = {
  //         user: storeAuth().username,
  //         clientId: clientId,
  //         productId: rowitem.productId,
  //         actionRequest: newrequest,
  //       }
  //       const objIndex = storeChanges().changesProducts.findIndex(
  //         (item) =>
  //           item.user === storeAuth().username &&
  //           item.clientId === clientId &&
  //           item.productId === rowitem.productId,
  //       )
  //       if (objIndex > -1) {
  //         storeChanges().delWithIndexChangesProducts(objIndex)
  //       }
  //       addToChangedIfNeeded(rowitem, clientId, newrequest, d)
  //     }
  //   }
  // }

  async function saveActionRequests(rowItem: any, newrequest: string) {
    const data = {
      clientIds: clientSelection.value,
      productIds: selectionProducts.value,
      actionRequest: newrequest,
    }
    lastChanges.value.clientIds = data.clientIds
    lastChanges.value.productIds = data.productIds

    bufferedChanges.value = data
  }

  async function saveActionRequest(rowitem: any, newrequest: string) {
    const data = {
      clientIds: selectionClients.value,
      productIds: [rowitem.productId],
      actionRequest: newrequest,
    }
    lastChanges.value.clientIds = data.clientIds
    lastChanges.value.productIds = data.productIds

    bufferedChanges.value = data
  }

  async function saveBufferedChanges() {
    await useSaveProductActionRequest($t).saveProdActionRequest(
      bufferedChanges.value,
      null,
      true,
    )

    bufferedChanges.value = {}
    productsRef.value?.refetch()
  }

  // function addToChangedIfNeeded(
  //   rowitem: any,
  //   clientId: string,
  //   newrequest: string,
  //   changeObj: any,
  // ) {
  //   const ic = rowitem.selectedClients?.indexOf(clientId)
  //   if (newrequest == 'mixed') {
  //     // nothing to do
  //   } else if (ic >= 0 && rowitem.actionRequestDetails?.[ic] === newrequest) {
  //     // nothing to do
  //   } else if (ic >= 0 && rowitem.actionRequestDetails?.[ic] !== newrequest) {
  //     storeChanges().pushToChangesProducts(changeObj)
  //     return true
  //   } else if (rowitem.actionRequest !== newrequest) {
  //     storeChanges().pushToChangesProducts(changeObj)
  //     return true
  //   }
  //   return false
  // }

  function changeProductsType(type: IProductTypes) {
    const fullUrl = router.currentRoute.value.fullPath
    router.push(
      fullUrl.replace(
        'products/' + currentType.value + '',
        'products/' + type + '/',
      ),
    )

    const types: Array<IProductTypes> = Object.keys(
      productsTypeChecked.value,
    ) as Array<IProductTypes>
    types.forEach((k) => (productsTypeChecked.value[k] = false))
    if (Object.keys(productsTypeChecked.value).includes(type))
      productsTypeChecked.value[type] = true
    else throw new Error('Unknown product type ' + type)

    productsRef.value?.refetch()
  }

  onBeforeRouteLeave((to, from, next) => {
    if (hasUnsavedChanges.value) {
      const answer = window.confirm($t('message.warning.unsaved_changes'))
      if (answer) {
        next()
      } else {
        next(false)
      }
    } else {
      next()
    }
  })
</script>
