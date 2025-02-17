<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <TableTTable
    ref="clientsRef"
    table-id="clients"
    :row-id="rowId"
    :is-mobile="props.isMobile"
    has-client-actions
    :action-clone="(rowData: any) => `/clients/client/clone/${rowData[rowId]}`"
    :action-log="(rowData: any) => `/clients/client/logs/${rowData[rowId]}`"
    :action-config="(rowData: any) => `/clients/client/config/${rowData[rowId]}`"
    :sort-by="storeTSettings.clientsSorting.column"
    :sort-desc="storeTSettings.clientsSorting.isDesc"
    :table-column="tableColumn"
    :fetch="fetchClients"
    @selection-changed="(id: string) => {storeSelection.toggleSelectionClients(id)}"
    @clear-selection="storeSelection.clearSelectionClients"
  >
    <template #toolbar-right>
      <el-button
        type="primary"
        @click="router.push('/clients/products/LocalbootProduct')"
      >
        <IconIIcon :icon="icons.product" />
        {{ $t('table.fields.products') }}
      </el-button>
      <ModalMServerSelection
        v-if="storeSelection.selectionDepots.length <= 0"
        @refetch="refetch"
      />
    </template>
  </TableTTable>
</template>

<script setup lang="tsx">
  import type { T_ClientsList } from '~/types/APItypes'
  import { useNotification } from '~/composables/mixins/useComponent'
  import { useMBus } from '~/composables/mixins/useMessagebus'

  import Checkbox from 'primevue/checkbox'
  import RadioButton from 'primevue/radiobutton'
  import Button from 'primevue/button'
  import Badge from 'primevue/badge'
  // import TTooltip from '../tooltip/TTooltip.vue'
  import IIcon from '../icon/IIcon.vue'
  import ILoading from '../icon/ILoading.vue'
  // import { Popover } from 'primevue'

  type TClientReach = Record<string, boolean | undefined>
  interface t_param_reachable {
    selectedClients?: string[]
  }

  const { notifyError, notifyInfo } = useNotification()
  const $t = useI18n().t
  const icons = useIcons()
  const router = useRouter()
  const _msgbus = useMBus(wsBusMsgObjectChanged, false, $t)
  const storeSelection = storeSelections()
  const storeTSettings = storeTablesettings()
  const { msgbusAutoRefresh } = storeToRefs(storeSettings())

  const props = defineProps({
    isMobile: {
      type: Boolean,
      default: () => {
        return false
      },
    },
  })
  const reachableClients = ref<TClientReach>({})
  const reachableClientsIsLoading = ref<TClientReach>({})
  const reachableClientsIsLoadingHeader = ref<boolean>(false)
  const rowId = 'clientId'
  const clientsRef = ref()
  const statisticsWidth = '30px'
  const statisticsWidthDyn = computed(() => {
    return ''
    // return storeTSettings.otherSettings['clients'].statisticIcons
    //   ? 'max-w-14'
    //   : 'max-w-9'
  })
  const tableColumn = ref([
    {
      title: '',
      key: 'selected',
      sortable: 'custom',
      type: 'selection',
      fixed: 'true',
      // icon: icons.checkBox,
      visible: true, // storeTSettings.clientsColumns.includes('selected'),
      alwaysVisible: true,
      className: props.isMobile ? 'max-w-10' : '!max-w-7',
      // maxWidth: props.isMobile ? '35px' : '60px',
      align: 'center',
      cellRenderer: ({ rowData }: any) => {
        if (!rowData?.[rowId]) return
        rowData.selected = storeSelection.selectionClients.includes(
          rowData[rowId],
        )
        watch(
          () => storeSelection.selectionClients,
          () => {
            rowData.selected = storeSelection.selectionClients.includes(
              rowData[rowId],
            )
          },
        )
        return storeSelection.multiSelection ? (
          <Checkbox model-value={rowData.selected} binary />
        ) : (
          <RadioButton
            model-value={rowData.selected}
            inputId={rowId + 'Selection-' + rowData[rowId]}
            name={rowId + 'selection'}
            value=""
            binary
          />
        )
      },
    },
    {
      title: $t('table.fields.id'),
      key: 'clientId',
      sortable: 'custom',
      visible: true, //storeTSettings.clientsColumns.includes('clientId'),
      alwaysVisible: true,
      className: '!px-2',
      class: '',
      fixed: 'true',
      filter: true,
      minWidth: '100px',
    },
    {
      title: $t('table.fields.mac'),
      key: 'macAddress',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes('macAddress'),
    },
    {
      title: $t('table.fields.ip'),
      key: 'ipAddress',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes('ipAddress'),
    },
    {
      title: $t('table.fields.description'),
      key: 'description',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes('description'),
    },
    {
      title: 'notes',
      key: 'notes',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes('notes'),
    },
    {
      title: $t('table.fields.lastSeen'),
      key: 'lastSeen',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes('lastSeen'),
      cellRenderer: ({ rowData }: any) => {
        return rowData.lastSeen ? (
          <span>{new Date(rowData.lastSeen).toLocaleString()}</span>
        ) : (
          <span />
        )
      },
    },
    {
      title: $t('table.fields.uefi'),
      key: 'uefi',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes('uefi'),
    },

    {
      title: $t('table.fields.versionOutdatedLocalboot'),
      key: 'version_outdated',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes('version_outdated'),
      minWidth: statisticsWidth,
      className: 'parent-statistics !min-w-min !w-fit !max-w-max !px-1 !py-0',
      classNameDyn: statisticsWidthDyn.value,
      icon: icons.productsOutdatedLocal,
      cellRenderer: getStatisticRenderer(
        $t('table.fields.versionOutdatedLocalboot'),
        icons.productsOutdatedLocal,
        '/clients/products/LocalbootProduct?sortBy=version&sortDesc=true&selectedClient=',
        'version_outdated',
        'version',
        'LocalbootProduct',
        Infinity,
        1,
      ),
    },
    {
      title: $t('table.fields.versionOutdatedNetboot'),
      key: 'version_outdated_netboot',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes(
        'version_outdated_netboot',
      ),

      minWidth: statisticsWidth,
      className: 'parent-statistics !min-w-min !w-fit !max-w-max !px-1 !py-0',
      classNameDyn: statisticsWidthDyn.value,
      icon: icons.productsOutdatedNet,
      cellRenderer: getStatisticRenderer(
        $t('table.fields.versionOutdatedNetboot'),
        icons.productsOutdatedNet,
        '/clients/products/NetbootProduct?sortBy=version&sortDesc=true&selectedClient=',
        'version_outdated_netboot',
        'version',
        'NetbootProduct',
        Infinity,
        1,
      ),
    },
    {
      title: $t('table.fields.installationStatusUnknown'),
      key: 'installationStatus_unknown',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes(
        'installationStatus_unknown',
      ),

      minWidth: statisticsWidth,
      className: 'parent-statistics !min-w-min !w-fit !max-w-max !px-1 !py-0 ',
      classNameDyn: statisticsWidthDyn.value,
      icon: icons.productInstallationStatusUnknown,
      cellRenderer: getStatisticRenderer(
        $t('table.fields.installationStatusUnknown'),
        icons.productInstallationStatusUnknown,
        '/clients/products/LocalbootProduct?sortBy=installationStatus&selectedClient=',
        'installationStatus_unknown',
        'installationStatus',
        undefined, // type
        Infinity, // errorValue
        1, // warnValue
      ),
    },
    {
      title: $t('table.fields.installationStatus_installed'),
      key: 'installationStatus_installed',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes(
        'installationStatus_installed',
      ),

      minWidth: statisticsWidth,
      className: 'parent-statistics !min-w-min !w-fit !max-w-max !px-1 !py-0 ',
      classNameDyn: statisticsWidthDyn.value,
      icon: icons.productInstallationStatusInstalled,
      cellRenderer: getStatisticRenderer(
        $t('table.fields.installationStatus_installed'),
        icons.productInstallationStatusInstalled,
        '/clients/products/LocalbootProduct?sortBy=installationStatus&selectedClient=',
        'installationStatus_installed',
        'installationStatus',
      ),
    },
    {
      title: $t('table.fields.actionResult_successful'),
      key: 'actionResult_successful',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes(
        'actionResult_successful',
      ),
      minWidth: statisticsWidth,
      className: 'parent-statistics !min-w-min !w-fit !max-w-max !px-1 !py-0 ',
      classNameDyn: statisticsWidthDyn.value,

      icon: icons.productActionResultSuccessful,
      cellRenderer: getStatisticRenderer(
        $t('table.fields.actionResult_successful'),
        icons.productActionResultSuccessful,
        '/clients/products/LocalbootProduct?sortBy=actionResult&selectedClient=',
        'actionResult_successful',
        'actionResult',
      ),
    },
    {
      title: $t('table.fields.actionResultFailed'),
      key: 'actionResult_failed',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes('actionResult_failed'),
      className: 'parent-statistics !min-w-min !w-fit !max-w-max !px-1 !py-0 ',
      classNameDyn: statisticsWidthDyn.value,

      minWidth: statisticsWidth,
      icon: icons.productsFailedActionResult,
      cellRenderer: getStatisticRenderer(
        $t('table.fields.actionResultFailed'),
        icons.productsFailedActionResult,
        '/clients/products/LocalbootProduct?sortBy=actionResult&selectedClient=',
        'actionResult_failed',
        'actionResult',
        undefined, // type
        1, // errorValue
        Infinity, // warnValue
      ),
    },
    {
      title: $t('table.fields.reachable'),
      key: 'reachable',
      sortable: false,
      visible: storeTSettings.clientsColumns.includes('reachable'),
      width: '60px',
      // {$t('table.fields.reachable')}
      headerCellRenderer: () => {
        return reachableClientsIsLoadingHeader.value ? (
          <ILoading small />
        ) : (
          <div>
            <el-text v-if={props.isMobile}></el-text>
            <el-button
              v-else
              link
              title={$t('button.reachables.title')}
              disabled={storeConfigapp().config?.read_only}
              onClick={handleClickReachable}
            >
              <IIcon icon={icons.clientReachable} />
            </el-button>
          </div>
        )
      },
      cellRenderer: ({ rowData }: any) => {
        const reachable =
          rowData.reachable || reachableClients.value[rowData.clientId]
        switch (reachable) {
          case true:
            return (
              <IIcon icon={icons.check} title={$t('label.reachable.true')} />
            )
          case false:
            return <IIcon icon={icons.x} title={$t('label.reachable.false')} />
          default:
            return reachableClientsIsLoading.value[rowData.clientId] ||
              reachableClientsIsLoadingHeader.value ? (
              <ILoading small />
            ) : (
              <el-button
                link
                class="text-right"
                title={$t('button.reachable.title')}
                disabled={storeConfigapp().config?.read_only}
                onClick={() => handleClickReachable([rowData.clientId])}
              >
                <IIcon icon={icons.clientReachable} />
              </el-button>
            )
        }
      },
    },
    {
      title: $t('table.fields.rowactions'),
      key: 'actions',
      sortable: false,
      visible: storeTSettings.clientsColumns.includes('actions'),
      alwaysVisible: true,
      className: '!max-w-max !min-w-min',
    },
  ])

  watch(
    () => storeTSettings.otherSettings['clients'].statisticIcons,
    () => {
      // clientsRef.value?.refetch()
      for (const column of tableColumn.value) {
        if (column.classNameDyn !== undefined) {
          column.classNameDyn = statisticsWidthDyn.value
        }
      }
    },
  )

  watch(
    () => storeTSettings.clientsSorting,
    () => {
      refetch()
    },
    { deep: true },
  )
  watch(
    () => storeSelection.selectionDepots,
    () => {
      refetch()
    },
  )

  function refetch() {
    clientsRef.value?.refetch()
  }
  async function fetchClients(params: any) {
    if (storeSelection.selectionDepots.length <= 0) {
      console.warn('no server selected')
      return {
        data: [],
        total: 0,
      }
    }
    params.selected = JSON.stringify(storeSelection.selectionClients)
    params.selectedDepots = JSON.stringify(storeSelection.selectionDepots)
    if (params.sortBy) {
      storeTSettings.clientsSorting.column = params.sortBy
      storeTSettings.clientsSorting.isDesc = params.sortDesc
    }
    const { data, error, headers } = await useApiGETBody<T_ClientsList>(
      '/opsidata/clients',
      params,
    )
    if (error) {
      console.error(error)
      notifyError({
        message: error?.response?.data?.message || $t('message.error.generic'),
      })
      return
    }
    if (data.value == undefined) {
      console.error(
        'empty response. data.value undefined, data: ',
        data,
        headers,
        error,
      )
      notifyError({ message: $t('message.error.empty-response') })
      return
    }
    return {
      data: data.value,
      total: parseInt(headers.get('x-total-count') || '0'),
    }
  }

  async function handleClickReachable(clientIds: string[]) {
    const params: t_param_reachable = {}
    if (clientIds?.length > 0) {
      params.selectedClients = clientIds
      for (const clientId of clientIds) {
        reachableClientsIsLoading.value[clientId] = true
      }
    } else {
      reachableClientsIsLoadingHeader.value = true
    }
    const { data, error } = await useApiGETBody<TClientReach>(
      '/opsidata/clients/reachable',
      params,
    )
    if (error) {
      console.error(error)
      notifyError({
        message: error?.response?.data?.message || $t('message.error.generic'),
      })
      return
    }
    for (const key in data.value) {
      const val = data.value[key]
      reachableClients.value[key] = val
    }
    if (clientIds?.length > 0) {
      for (const clientId of clientIds) {
        reachableClientsIsLoading.value[clientId] = false
      }
    }
    reachableClientsIsLoadingHeader.value = false
  }

  async function wsBusMsgObjectChanged(msg: any = undefined) {
    if (msg == undefined) return

    if (['event:host_created', 'event:host_deleted'].includes(msg.channel)) {
      if (msgbusAutoRefresh.value) {
        clientsRef.value?.refetch()
        return
      }
      notifyInfo({
        title: $t('message.info.event'),
        message: $t('message.info.event.client_updated', {
          clientId: msg.data.id,
        }),
        button: {
          label: $t('label.reloadPage'),
          onClick: clientsRef.value?.refetch,
        },
      })
    }
    if (['host_connected', 'host_disconnected'].includes(msg.event)) {
      console.warn('message bus: ', msg)
      // TODO: implement
    }
  }

  function getStatisticRenderer(
    tootltip: string,
    icon: string,
    url: string,
    value: string,
    sortByKey: string,
    type: undefined | string = undefined,
    errorValue: number = Infinity,
    warnValue: number = Infinity,
  ): (rowData: any) => VNode {
    return ({ rowData }: any) => {
      // const op = ref<any>()
      function click() {
        router.push(url + rowData.clientId)
      }

      const checked = computed(() => {
        const currentRoute = router.currentRoute.value.fullPath
        if (type) {
          return (
            currentRoute.includes('sortBy=' + sortByKey) &&
            currentRoute.includes('selectedClient=' + rowData.clientId) &&
            currentRoute.includes('/' + type + '?')
          )
        }
        return (
          currentRoute.includes('sortBy=' + sortByKey) &&
          currentRoute.includes('selectedClient=' + rowData.clientId)
        )
      })
      const severity = computed(() => {
        if (checked.value) return 'primary'
        if (rowData[value] >= errorValue) return 'danger'
        if (rowData[value] >= warnValue) return 'warn'
        return 'success'
      })
      const val = computed<string>(() => {
        let _val = rowData[value] || 0
        if (value == 'version_outdated' && type == 'LocalbootProduct') {
          _val = Math.max(
            rowData[value] - rowData.version_outdated_netboot || 0,
            0,
          )
        }
        return _val
      })
      return rowData[value] ? (
        <Button
          onClick={click}
          class="flex m-auto p-auto"
          title={rowData[value] + ' ' + tootltip}
        >
          {storeTSettings.otherSettings['clients'].statisticIcons ? (
            <IIcon icon={icon} class="min-w-5 min-h-5 mr-0 pr-0" />
          ) : null}
          <Badge
            value={val.value}
            severity={severity.value}
            class="!m-0 !p-0 !border-0"
            size="small"
          />
        </Button>
      ) : (
        <span />
      )
    }
  }
</script>
<style scoped>
  /* :deep(.parent-statistics) {
    border-left: 2px solid var(--el-border-color) !important;
  }
  :deep(.parent-statistics:not(:has(~ .parent-statistics))) {
    border-right: 2px solid var(--el-border-color) !important;
  } */

  /* :deep(td .cell),
  :deep(th .cell) {
    min-width: min-content;
    max-width: max-content;
    padding: 1px;
  } */
  /* :deep(.parent-statistics),
  :deep(.parent-statistics .cell) {
  } */
</style>
