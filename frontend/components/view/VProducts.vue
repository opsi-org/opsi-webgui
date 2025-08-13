<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <TableTTable
    ref="productsRef"
    table-id="products"
    :is-mobile="isMobile"
    :row-id="rowId"
    :table-column="tableColumn"
    :fetch="fetchProducts"
    :sort-by="sortBy"
    :sort-desc="sortDesc"
    :action-config="(rowData: any) => {
      return !props.isChild ?
        `/products/${currentType}/config/${rowData[rowId]}`
        : `/clients/products/${currentType}/config/${rowData[rowId]}`
    }"
    @selection-changed="(id: string) => {storeSelection.toggleSelectionProducts(id)}"
    @clear-selection="storeSelection.clearSelectionProducts"
  >
    <template #toolbar-right>
      <el-button
        :type="changesProductsExists && storeSelection.selectionClients.length > 0 ? 'success' : ''"
        :disabled="!changesProductsExists || storeSelection.selectionClients.length <= 0"
        @click="openBufferedChangesModal = true"
      >
        {{ $t('save') }}
      </el-button>
      <DialogDProcessActions />
      <el-dialog
        v-model="openBufferedChangesModal"
        align-center
        :width="isMobile ? '100%' : '80%'"
        append-to-body
      >
        <PanelPChanges
          :buffered-changes="changesProducts"
          @save="saveBufferedChanges"
          @discard="discardAllChanges"
          @delete-one="discardOneChange"
        />
        <PanelPOnDemand
          :title="$t('processActionsSave')"
          :product-ids="changesProductsProducts"
          @pre-action="saveBufferedChanges"
        />
      </el-dialog>

      <ModalMServerSelection
        v-if="storeSelection.selectionDepots.length <= 0"
        @refetch="refetch"
        :refetch-on-cancel="hasRowsWrapper"
      />
    </template>
    <template #header>
      <div>
        <el-checkbox-button
          v-model="productsTypeChecked.LocalbootProduct"
          @change="changeProductsType('LocalbootProduct')"
          >{{ $t('localbootProducts') }}</el-checkbox-button
        >
        <el-checkbox-button
          v-model="productsTypeChecked.NetbootProduct"
          @change="changeProductsType('NetbootProduct')"
          >{{ $t('netbootProducts') }}</el-checkbox-button
        >
        <el-alert
          v-if="props.selectedClient"
          :title="$t('message.productsOnClient', { id: props.selectedClient })"
          type="info"
          show-icon
          :closable="false"
          class="!inline-flex !relative max-h-8"
        />
      </div>
    </template>
  </TableTTable>
</template>

<script setup lang="tsx">
  import type { IProductTypes, T_Client2Depot } from '~/types/APItypes'
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
  import type { IChangeProducts, IChangeProductsFlat } from '~/types/tobjects'

  const { notifyInfo } = useNotification()
  const $t = useI18n().t
  const mq = useMQ()
  const navigation = useNavigate()
  const icons = useIcons()
  const router = useRouter()
  const fetchClient = useClient()
  useMBus(wsBusMsgObjectChanged, false, $t)

  const storeSelection = storeSelections()
  const storeTSettings = storeTablesettings()
  const { msgbusAutoRefresh } = storeToRefs(storeSettings())
  const { productActionRequest } = storeToRefs(storeInternalData())
  const { changesProductsProducts, changesProductsExists, changesProducts, changesProductsFlat } =
    storeToRefs(storeChanges())

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
    sortBy: { type: String, default: 'productId' },
    sortDesc: {
      type: [Boolean, String],
      default: false,
      validator: (value: boolean | string) => {
        if (typeof value === 'boolean') return true
        if (typeof value === 'string') {
          return ['true', 'false'].includes(value.toLowerCase())
        }
        return false
      },
    },
    selectedClient: { type: String, default: undefined },
  })

  const id = 'products'
  const rowId = 'productId'
  // Refs
  const productsRef = ref()
  const { selectionDepots, selectionClients, selectionProducts } = storeToRefs(storeSelection)
  const clientSelection: Ref<Array<string>> =
    props.selectedClient !== undefined ? ref([props.selectedClient]) : ref(selectionClients.value)
  const fetchedDataClients2Depots = ref<T_Client2Depot>({})
  const lastChanges = ref<IChangeProducts>() // used to check if we caused the last event
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
      sortable: 'custom',
      type: 'selection',
      visible: storeTSettings.productsColumns.includes('selected'),
      alwaysVisible: true,
      className: props.isMobile ? 'max-w-10' : '!max-w-7',
      align: 'center',
      cellRenderer: ({ rowData }: any) => {
        if (!rowData?.[rowId]) return
        rowData.selected = storeSelection.selectionProducts.includes(rowData[rowId])
        watch(
          () => storeSelection.selectionProducts,
          () => {
            rowData.selected = storeSelection.selectionProducts.includes(rowData[rowId])
          }
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
      title: $t('installationStatus'),
      key: 'installationStatus',
      sortable: 'custom',
      // using this visibilityCondition do not change the visibility state in store (have to be updated manually on clientselection change)
      visibilityCondition: clientSelection.value.length > 0,
      visible: storeTSettings.productsColumns.includes('installationStatus'),
      className: 'max-w-8 min-w-min max-w-max',
      icon: icons.product,
      cellRenderer: ({ rowData }: any) => {
        return (
          <>
            {clientSelection.value.length > 0 ? (
              <TCBadgeCompares
                type="installationStatus"
                rowid={rowData.productId}
                values={rowData.installationStatusDetails || [rowData.installationStatus] || []}
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
      title: $t('actionResult'),
      key: 'actionResult',
      sortable: 'custom',
      visibilityCondition: clientSelection.value.length > 0,
      visible: storeTSettings.productsColumns.includes('actionResult'),
      className: 'max-w-8  min-w-min max-w-max',
      icon: icons.productActionResult,
      cellRenderer: ({ rowData }: any) => {
        return (
          <>
            {/* v-if={clientSelection.value.length > 0} */}
            {clientSelection.value.length > 0 ? (
              <TCBadgeCompares
                type="actionResult"
                rowid={rowData.productId}
                values={rowData.actionResultDetails || [rowData.actionResult] || []}
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
      title: $t('productId'),
      key: 'productId',
      sortable: 'custom',
      alwaysVisible: true,
      visible: storeTSettings.productsColumns.includes('productId'),
      filter: true,
    },
    {
      title: $t('description'),
      key: 'description',
      sortable: 'custom',
      visible: storeTSettings.productsColumns.includes('description'),
    },
    {
      title: $t('advice'),
      key: 'advice',
      sortable: 'custom',
      visible: storeTSettings.productsColumns.includes('advice'),
    },
    {
      title: $t('modificationTime'),
      key: 'modificationTime',
      sortable: 'custom',
      visible: storeTSettings.productsColumns.includes('modificationTime'),
    },
    {
      title: $t('priority'),
      key: 'priority',
      sortable: 'custom',
      visible: storeTSettings.productsColumns.includes('priority'),
    },
    {
      title: $t('version'),
      key: 'version',
      sortable: 'custom',
      visible: storeTSettings.productsColumns.includes('version'),
      cellRenderer: ({ rowData }: any) => {
        return (
          <TCProductVersionCell
            type="depotVersions"
            row={rowData}
            selectedClients={clientSelection.value}
            clients2depots={fetchedDataClients2Depots.value}
          />
        )
      },
    },
    {
      title: $t('actionProgress'),
      key: 'actionProgress',
      sortable: 'custom',
      visibilityCondition: clientSelection.value.length > 0,
      visible: storeTSettings.productsColumns.includes('actionProgress'),
    },
    {
      title: $t('actionRequest'),
      key: 'actionRequest',
      sortable: 'custom',
      visibilityCondition: clientSelection.value.length > 0,
      visible: storeTSettings.productsColumns.includes('actionRequest'),
      className: 'max-w-28',
      headerCellRenderer: mq.isMobile.value
        ? undefined
        : () => {
            return (
              <TCProductRequest
                title={$t('message.setActionRequestForSelectedProducts')}
                onSave={saveActionRequestsLocally}
              />
            )
          },
      cellRenderer: ({ rowData }: any) => {
        return (
          <TCProductRequest
            modelValue={rowData}
            row-is-selected={selectionProducts.value.includes(rowData.productId)}
            onSave={saveActionRequestLocally}
          />
        )
      },
    },
    {
      title: $t('actions'),
      key: 'actions',
      sortable: false,
      visible: storeTSettings.productsColumns.includes('actions'),
      alwaysVisible: true,
      className: '!max-w-42 !w-12',
      cellRenderer: ({ rowData }: any) => {
        const change = () => {
          emit('change', rowData.productId)
          navigation.toConfiguration(id, rowData.productId, props.isChild, currentType.value)
        }
        return (
          <div class="flex flex-row">
            <BTNRowLink
              is-pressed={navigation.rowactionConfigChecked.value[rowData.productId]}
              icon={icons.settings}
              onOnClick={change}
            />
          </div>
        )
      },
    },
  ])

  const openBufferedChangesModal = ref(false)
  const hasRowsWrapper = computed(() => productsRef.value?.hasRows.value)

  onMounted(async () => {
    if (props.productType && props.productType !== currentType.value)
      changeProductsType(props.productType as IProductTypes)
    fetchedDataClients2Depots.value = await fetchClient.getClientToDepot(clientSelection.value)
    //refetch() // triggered by watchers
  })

  watch(
    () => selectionClients.value,
    async () => {
      if (props.selectedClient === undefined) {
        clientSelection.value = selectionClients.value

        fetchedDataClients2Depots.value = await fetchClient.getClientToDepot(clientSelection.value)
        productsRef.value?.refetch()
        updateColumnVisibility()
      }
    },
    { deep: true }
  )
  watch(
    () => props.selectedClient,
    async (v) => {
      if (v !== undefined) {
        clientSelection.value = [v]
      } else {
        clientSelection.value = selectionClients.value
      }

      fetchedDataClients2Depots.value = await fetchClient.getClientToDepot(clientSelection.value)
      productsRef.value?.refetch()
      updateColumnVisibility()
    }
  )
  watch(() => selectionDepots.value, refetch)

  function updateColumnVisibility() {
    const cols = ['installationStatus', 'actionResult', 'actionProgress', 'actionRequest']

    for (const col of tableColumn.value) {
      const key = col.key as string
      if (!cols.includes(key)) continue
      col.visibilityCondition = clientSelection.value.length > 0
    }
  }
  function refetch() {
    productsRef.value?.refetch()
  }
  function discardOneChange(row: IChangeProductsFlat) {
    storeChanges().delFromChangesProducts(row)
    /*productsRef.value?.refetch()*/
  }
  function discardAllChanges() {
    storeChanges().clearChangesProducts()
    refetch()
    openBufferedChangesModal.value = false
  }

  async function fetchProducts(_params: any) {
    const params = prepareParams(_params)

    if (_params.sortBy) {
      storeTSettings.productsSorting.column = _params.sortBy
      storeTSettings.productsSorting.isDesc = _params.sortDesc
    }
    const { data, error, headers } = await useApiGETBody<Array<any>>('/opsidata/products', params)

    if (error) {
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
      if (lastChanges.value?.[msg.data.clientId]?.[msg.data.productId]) {
        delete lastChanges.value?.[msg.data.clientId]?.[msg.data.productId]
      } else {
        if (msgbusAutoRefresh.value) {
          productsRef.value?.refetch()
          return
        }

        // check if we may cause the event...
        notifyInfo({
          title: $t('opsiMessageBus'),
          message: $t('opsiMessageBus.poc_updated', {
            productId: msg.data.productId,
          }),
          button: {
            label: $t('reloadPage'),
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
      if (selectionProducts.value.length > 0) {
        params.sortDesc = true
        params.selected = JSON.stringify(selectionProducts.value)
      } else {
        params.sortBy = 'productId'
      }
    }
    return params
  }

  async function saveActionRequestsLocally(rowitem: any, newrequest: string) {
    for (const productId of selectionProducts.value) {
      const rowitem = productsRef.value?.getRowById(productId)
      if (rowitem && newrequest) {
        await saveActionRequestLocally(rowitem, newrequest)
      } else {
        console.error(
          'saveActionRequestsLocally: rowitem not found or newrequest is empty',
          rowitem,
          newrequest
        )
      }
    }
  }

  async function saveActionRequestLocally(rowitem: any, newrequest: string) {
    const idx = storeChanges().pushChangesProduct(
      selectionClients.value,
      [rowitem.productId],
      newrequest,
      productActionRequest.value[rowitem.productId] || rowitem.actionRequest || 'none'
    )
    if (idx === true) {
      return
    }
  }

  async function saveBufferedChanges() {
    lastChanges.value = { ...changesProducts.value }
    // clients with same products and actionRequests

    for (const change of changesProductsFlat.value) {
      await useSaveProductActionRequest($t).saveProdActionRequest(change, null, true)
    }

    discardAllChanges()
    productsRef.value?.refetch()
    openBufferedChangesModal.value = false
  }

  function changeProductsType(type: IProductTypes) {
    const currentFullUrl = router.currentRoute.value.fullPath
    //let urlChanged = false
    if (!currentFullUrl.includes(`/products/${type}`)) {
      let newFullUrl
      if (!props.isChild) {
        newFullUrl = currentFullUrl.replace(/\/products\/\w+/, `/products/${type}`)
      } else {
        newFullUrl = currentFullUrl.replace(/\/clients\/products\/\w+/, `/clients/products/${type}`)
      }
      //urlChanged = true
      router.push(newFullUrl)
    }
    const types: Array<IProductTypes> = Object.keys(
      productsTypeChecked.value
    ) as Array<IProductTypes>
    types.forEach((k) => (productsTypeChecked.value[k] = false))
    if (Object.keys(productsTypeChecked.value).includes(type))
      productsTypeChecked.value[type] = true
    else throw new Error('Unknown product type ' + type)
    //if (!router.currentRoute.value.query.sortBy && urlChanged) {
    // if it is in query, the sortBy will trigger a refetch
    productsRef.value?.refetch()
    //}
  }

  onBeforeRouteLeave((to, from, next) => {
    if (changesProductsExists.value && storeAuth().isAuthenticated) {
      const answer = window.confirm($t('message.unsavedChanges'))
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
<style scoped>
  :deep(.column-installationStatus),
  :deep(.column-installationStatus .cell),
  :deep(.column-actionResult),
  :deep(.column-actionResult .cell) {
    min-width: min-content;
    max-width: max-content;
    padding: 1px;
  }
</style>
