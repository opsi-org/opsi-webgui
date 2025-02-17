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
    :action-config="(rowData: any) => `/products/${currentType}/config/${rowData[rowId]}`"
    @selection-changed="(id: string) => {storeSelection.toggleSelectionProducts(id)}"
    @clear-selection="storeSelection.clearSelectionProducts"
  >
    <template #toolbar-right>
      <el-button
        :type="hasUnsavedChanges ? 'success' : ''"
        :disabled="!hasUnsavedChanges"
        @click="openBufferedChangesModal = true"
      >
        {{ $t('button.save') }}
      </el-button>
      <el-dialog
        v-model="openBufferedChangesModal"
        title="Unsaved changes"
        align-center
      >
        <el-table :data="bufferedChanges">
          <el-table-column prop="productIds" label="Selected Product IDs">
            <template #default="scope">
              <ul>
                <li v-for="product in scope.row.productIds" :key="product">
                  {{ product }}
                </li>
              </ul>
            </template>
          </el-table-column>
          <el-table-column
            prop="actionRequest"
            label="Action Request"
          ></el-table-column>
          <el-table-column
            prop="oldActionRequest"
            label="Old Action Request"
          ></el-table-column>
        </el-table>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="danger" @click="discardAllChanges">{{
              $t('label.discardAll')
            }}</el-button>

            <el-button
              :type="hasUnsavedChanges ? 'success' : ''"
              :disabled="!hasUnsavedChanges"
              @click="saveBufferedChanges"
            >
              {{ $t('button.save') }}
            </el-button>
          </div>
        </template>
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

  const { notifyInfo, notifyError } = useNotification()
  const $t = useI18n().t
  const navigation = useNavigate()
  const icons = useIcons()
  const router = useRouter()
  const fetchClient = useClient()
  useMBus(wsBusMsgObjectChanged, false, $t)

  const storeSelection = storeSelections()
  const storeCookie = storeTablesettings()
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
    sortBy: { type: String, default: 'productId' },
    sortDesc: { type: Boolean, default: false },
    selectedClient: { type: String, default: undefined },
  })
  const sortBy = ref(props.sortBy)
  const sortDesc = ref(props.sortDesc)

  const id = 'products'
  const rowId = 'productId'
  // Refs
  const productsRef = ref()
  const { selectionDepots, selectionClients, selectionProducts } =
    storeToRefs(storeSelection)
  const clientSelection: Ref<Array<string>> =
    props.selectedClient !== undefined
      ? ref([props.selectedClient])
      : ref(selectionClients.value)
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
      sortable: 'custom',
      type: 'selection',
      visible: storeCookie.productsColumns.includes('selected'),
      alwaysVisible: true,
      className: props.isMobile ? 'max-w-10' : '!max-w-7',
      align: 'center',
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
      sortable: 'custom',
      visible:
        clientSelection.value.length > 0 &&
        storeCookie.productsColumns.includes('installationStatus'),
      className: 'max-w-8 min-w-min max-w-max',
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
      sortable: 'custom',
      visible:
        clientSelection.value.length > 0 &&
        storeCookie.productsColumns.includes('actionResult'),
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
      sortable: 'custom',
      alwaysVisible: true,
      visible: storeCookie.productsColumns.includes('productId'),
      filter: true,
    },
    {
      title: $t('table.fields.description'),
      key: 'description',
      sortable: 'custom',
      visible: storeCookie.productsColumns.includes('description'),
    },
    {
      title: $t('table.fields.advice'),
      key: 'advice',
      sortable: 'custom',
      visible: storeCookie.productsColumns.includes('advice'),
    },
    {
      title: $t('table.fields.modificationTime'),
      key: 'modificationTime',
      sortable: 'custom',
      visible: storeCookie.productsColumns.includes('modificationTime'),
    },
    {
      title: $t('table.fields.priority'),
      key: 'priority',
      sortable: 'custom',
      visible: storeCookie.productsColumns.includes('priority'),
    },
    {
      title: $t('table.fields.version'),
      key: 'version',
      sortable: 'custom',
      visible: storeCookie.productsColumns.includes('version'),
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
      title: $t('table.fields.actionProgress'),
      key: 'actionProgress',
      sortable: 'custom',
      visible:
        selectionClients.value.length > 0 &&
        storeCookie.productsColumns.includes('actionProgress'),
    },
    {
      title: $t('table.fields.actionRequest'),
      key: 'actionRequest',
      sortable: 'custom',
      visible:
        clientSelection.value.length > 0 &&
        storeCookie.productsColumns.includes('actionRequest'),
      className: 'max-w-28',
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
      visible: storeCookie.productsColumns.includes('actions'),
      alwaysVisible: true,
      className: '!max-w-42 !w-12',
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

  const openBufferedChangesModal = ref(false)
  const bufferedChanges = ref<Array<any>>([])

  const hasUnsavedChanges = computed(() => bufferedChanges.value?.length > 0)
  const hasRowsWrapper = computed(() => productsRef.value?.hasRows.value)

  onMounted(async () => {
    if (props.productType && props.productType !== currentType.value)
      changeProductsType(props.productType as IProductTypes)
    fetchedDataClients2Depots.value = await fetchClient.getClientToDepot(
      clientSelection.value,
    )
    productsRef.value?.refetch()
  })

  storeCookie.setSortColumn('products', sortBy.value, sortDesc.value)
  watch(
    () => props.sortBy,
    () => {
      sortBy.value = props.sortBy
      storeCookie.setSortColumn('products', sortBy.value, sortDesc.value)
    },
  )
  watch(
    () => props.sortDesc,
    () => {
      sortDesc.value = props.sortDesc
      storeCookie.setSortColumn('products', sortBy.value, sortDesc.value)
    },
  )
  watch(
    () => storeCookie.productsSorting,
    () => {
      // refetch()
      sortBy.value = storeCookie.productsSorting.column
      sortDesc.value = storeCookie.productsSorting.isDesc
    },
    { deep: true },
  )
  watch(
    () => selectionClients.value,
    async () => {
      if (props.selectedClient === undefined) {
        clientSelection.value = selectionClients.value

        fetchedDataClients2Depots.value = await fetchClient.getClientToDepot(
          clientSelection.value,
        )
        productsRef.value?.refetch()
      }
    },
    { deep: true },
  )
  watch(
    () => props.selectedClient,
    async (v) => {
      if (v !== undefined) {
        clientSelection.value = [v]
      } else {
        clientSelection.value = selectionClients.value
      }

      fetchedDataClients2Depots.value = await fetchClient.getClientToDepot(
        clientSelection.value,
      )
      productsRef.value?.refetch()
    },
  )
  watch(() => selectionDepots.value, refetch)

  function refetch() {
    productsRef.value?.refetch()
  }

  function discardAllChanges() {
    bufferedChanges.value = []
    openBufferedChangesModal.value = false
  }

  async function fetchProducts(_params: any) {
    const params = prepareParams(_params)

    if (params.sortBy) {
      storeCookie.productsSorting.column = params.sortBy
      storeCookie.productsSorting.isDesc = params.sortDesc
    }
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
      if (selectionProducts.value.length > 0) {
        params.sortDesc = true
        params.selected = JSON.stringify(selectionProducts.value)
      } else {
        params.sortBy = 'productId'
      }
    }
    return params
  }

  async function saveActionRequests(rowItem: any, newrequest: string) {
    const data = {
      clientIds: clientSelection.value,
      productIds: selectionProducts.value,
      actionRequest: newrequest,
      oldActionRequest: rowItem.actionRequest,
    }
    lastChanges.value.clientIds = data.clientIds
    lastChanges.value.productIds = data.productIds

    bufferedChanges.value.push(data)
  }

  async function saveActionRequest(rowitem: any, newrequest: string) {
    const data = {
      clientIds: selectionClients.value,
      productIds: [rowitem.productId],
      actionRequest: newrequest,
      oldActionRequest: rowitem.actionRequest,
    }
    lastChanges.value.clientIds = data.clientIds
    lastChanges.value.productIds = data.productIds

    bufferedChanges.value.push(data)
  }

  async function saveBufferedChanges() {
    for (const change of bufferedChanges.value) {
      const { oldActionRequest, ...data } = change
      await useSaveProductActionRequest($t).saveProdActionRequest(
        data,
        null,
        true,
      )
    }

    bufferedChanges.value = []
    productsRef.value?.refetch()
    openBufferedChangesModal.value = false
  }

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
      const answer = window.confirm($t('message.warning.unsavedChanges'))
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
