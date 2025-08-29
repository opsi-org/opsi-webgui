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
    :action-clone="(rowData: any) => `/clients/${rowData[rowId]}/clone`"
    :action-log="(rowData: any) => `/clients/${rowData[rowId]}/logs`"
    :action-config="(rowData: any) => `/clients/${rowData[rowId]}/config`"
    :sort-by="storeTSettings.clientsSorting.column"
    :sort-desc="storeTSettings.clientsSorting.isDesc"
    :table-column="tableColumn"
    :fetch="fetchClients"
    @selection-changed="(id: string) => {storeSelection.toggleSelectionClients(id)}"
    @clear-selection="storeSelection.clearSelectionClients"
  >
    <template #toolbar-right>
      <el-button
        v-if="storeTSettings.filterQuery['clients']"
        @click="storeTSettings.filterQuery['clients'] = ''"
        data-testid="clients-filterGroups-button"
        type="warning"
        :title="$t('clearFilterGroups')"
      >
        <IconIIcon :icon="icons.filterFilled" />
      </el-button>
      <el-button
        type="primary"
        @click="router.push('/clients/products/LocalbootProduct')"
        data-testid="clients-products-button"
      >
        <IconIIcon :icon="icons.product" />
        {{ $t('products') }}
      </el-button>
      <ModalMServerSelection v-if="storeSelection.selectionDepots.length <= 0" @refetch="refetch" />
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
  import IIcon from '../icon/IIcon.vue'
  import ILoading from '../icon/ILoading.vue'

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
  })
  const tableColumn = ref([
    {
      title: '',
      key: 'selected',
      sortable: 'custom',
      type: 'selection',
      fixed: 'true',
      visible: true, // storeTSettings.clientsColumns.includes('selected'),
      alwaysVisible: true,
      className: props.isMobile ? 'max-w-10' : '!max-w-7 !min-w-7 !w-7',
      align: 'center',
      cellRenderer: ({ rowData }: any) => {
        if (!rowData?.[rowId]) return
        rowData.selected = storeSelection.selectionClients.includes(rowData[rowId])
        watch(
          () => storeSelection.selectionClients,
          () => {
            rowData.selected = storeSelection.selectionClients.includes(rowData[rowId])
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
          />
        )
      },
    },
    {
      title: $t('clientId'),
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
      title: $t('macAddress'),
      key: 'macAddress',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes('macAddress'),
    },
    {
      title: $t('ipAddress'),
      key: 'ipAddress',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes('ipAddress'),
    },
    {
      title: $t('description'),
      key: 'description',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes('description'),
    },
    {
      title: $t('notes'),
      key: 'notes',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes('notes'),
    },
    {
      title: $t('lastSeen'),
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
      title: $t('uefi'),
      key: 'uefi',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes('uefi'),
    },

    {
      title: $t('version_outdated_localboot'),
      key: 'version_outdated',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes('version_outdated'),
      minWidth: statisticsWidth,
      className: 'parent-statistics !min-w-min !w-fit !max-w-max !px-1 !py-0',
      classNameDyn: statisticsWidthDyn.value,
      icon: icons.productsOutdatedLocal,
      cellRenderer: getStatisticRenderer(
        $t('version_outdated_localboot'),
        icons.productsOutdatedLocal,
        '/clients/products/LocalbootProduct?sortBy=version&sortDesc=true&selectedClient=',
        'version_outdated',
        'version',
        'LocalbootProduct',
        Infinity,
        1
      ),
    },
    {
      title: $t('version_outdated_netboot'),
      key: 'version_outdated_netboot',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes('version_outdated_netboot'),

      minWidth: statisticsWidth,
      className: 'parent-statistics !min-w-min !w-fit !max-w-max !px-1 !py-0',
      classNameDyn: statisticsWidthDyn.value,
      icon: icons.productsOutdatedNet,
      cellRenderer: getStatisticRenderer(
        $t('version_outdated_netboot'),
        icons.productsOutdatedNet,
        '/clients/products/NetbootProduct?sortBy=version&sortDesc=true&selectedClient=',
        'version_outdated_netboot',
        'version',
        'NetbootProduct',
        Infinity,
        1
      ),
    },
    {
      title: $t('installationStatus_unknown'),
      key: 'installationStatus_unknown',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes('installationStatus_unknown'),

      minWidth: statisticsWidth,
      className: 'parent-statistics !min-w-min !w-fit !max-w-max !px-1 !py-0 ',
      classNameDyn: statisticsWidthDyn.value,
      icon: icons.productInstallationStatusUnknown,
      cellRenderer: getStatisticRenderer(
        $t('installationStatus_unknown'),
        icons.productInstallationStatusUnknown,
        '/clients/products/LocalbootProduct?sortBy=installationStatus&selectedClient=',
        'installationStatus_unknown',
        'installationStatus',
        undefined, // type
        Infinity, // errorValue
        1 // warnValue
      ),
    },
    {
      title: $t('installationStatus_installed'),
      key: 'installationStatus_installed',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes('installationStatus_installed'),

      minWidth: statisticsWidth,
      className: 'parent-statistics !min-w-min !w-fit !max-w-max !px-1 !py-0 ',
      classNameDyn: statisticsWidthDyn.value,
      icon: icons.productInstallationStatusInstalled,
      cellRenderer: getStatisticRenderer(
        $t('installationStatus_installed'),
        icons.productInstallationStatusInstalled,
        '/clients/products/LocalbootProduct?sortBy=installationStatus&selectedClient=',
        'installationStatus_installed',
        'installationStatus'
      ),
    },
    {
      title: $t('actionResult_successful'),
      key: 'actionResult_successful',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes('actionResult_successful'),
      minWidth: statisticsWidth,
      className: 'parent-statistics !min-w-min !w-fit !max-w-max !px-1 !py-0 ',
      classNameDyn: statisticsWidthDyn.value,

      icon: icons.productActionResultSuccessful,
      cellRenderer: getStatisticRenderer(
        $t('actionResult_successful'),
        icons.productActionResultSuccessful,
        '/clients/products/LocalbootProduct?sortBy=actionResult&selectedClient=',
        'actionResult_successful',
        'actionResult'
      ),
    },
    {
      title: $t('actionResult_failed'),
      key: 'actionResult_failed',
      sortable: 'custom',
      visible: storeTSettings.clientsColumns.includes('actionResult_failed'),
      className: 'parent-statistics !min-w-min !w-fit !max-w-max !px-1 !py-0 ',
      classNameDyn: statisticsWidthDyn.value,

      minWidth: statisticsWidth,
      icon: icons.productsFailedActionResult,
      cellRenderer: getStatisticRenderer(
        $t('actionResult_failed'),
        icons.productsFailedActionResult,
        '/clients/products/LocalbootProduct?sortBy=actionResult&selectedClient=',
        'actionResult_failed',
        'actionResult',
        undefined, // type
        1, // errorValue
        Infinity // warnValue
      ),
    },
    {
      title: $t('reachable'),
      key: 'reachable',
      sortable: true,
      visible: storeTSettings.clientsColumns.includes('reachable'),
      width: '60px',
      headerCellRenderer: () => {
        const reachableMode = storeTSettings.otherSettings.clients.reachableAllClients
          ? $t('(allClients)')
          : $t('(selectedClients)')
        return reachableClientsIsLoadingHeader.value ? (
          <ILoading small />
        ) : (
          <div>
            {props.isMobile ? (
              <el-text></el-text>
            ) : (
              <el-button
                link
                title={$t('checkClientReachability') + ' ' + reachableMode}
                disabled={storeConfigapp().config?.read_only}
                onClick={() => handleClickReachable()}
              >
                <IIcon icon={icons.clientReachable} />
              </el-button>
            )}
          </div>
        )
      },
      cellRenderer: ({ rowData }: any) => {
        let reachable: boolean | undefined = rowData.reachable
        if (rowData.reachable == undefined) reachable = reachableClients.value[rowData.clientId]
        switch (reachable) {
          case true:
            return <IIcon icon={icons.check} title={$t('message.clientIsReachable')} />
          case false:
            return <IIcon icon={icons.x} title={$t('message.clientIsNotReachable')} />
          default:
            return reachableClientsIsLoading.value[rowData.clientId] ||
              reachableClientsIsLoadingHeader.value ? (
              <ILoading small />
            ) : (
              <el-button
                link
                class="text-right"
                title={$t('checkClientReachability')}
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
      title: $t('actions'),
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
      for (const column of tableColumn.value) {
        if (column.classNameDyn !== undefined) {
          column.classNameDyn = statisticsWidthDyn.value
        }
      }
    }
  )
  watch(
    () => storeTSettings.filterQuery['clients'],
    () => {
      refetch()
    }
  )
  watch(
    () => storeTSettings.clientsSorting,
    () => {
      refetch()
    },
    { deep: true }
  )
  watch(
    () => storeSelection.selectionDepots,
    () => {
      refetch()
    }
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
    if (storeTSettings.filterQuery['clients']) {
      params.filteredGroups = storeTSettings.filterQuery['clients']
    }
    if (params.sortBy) {
      storeTSettings.clientsSorting.column = params.sortBy
      storeTSettings.clientsSorting.isDesc = params.sortDesc
    }
    const { data, error, headers } = await useApiGETBody<T_ClientsList>('/opsidata/clients', params)
    if (error) {
      console.error(error)
      return
    }
    if (data.value == undefined) {
      console.error('empty response. data.value undefined, data: ', data, headers, error)
      notifyError({ message: $t('message.error.emptyResponse') })
      return
    }
    return {
      data: data.value,
      total: parseInt(headers.get('x-total-count') || '0'),
    }
  }

  async function handleClickReachable(clientIds: string[] | undefined = undefined) {
    const params: t_param_reachable = {}
    if (clientIds == undefined || clientIds?.length <= 0) {
      if (storeTSettings.otherSettings.clients.reachableAllClients) {
        // check reachability for all clients
        reachableClientsIsLoadingHeader.value = true
      } else {
        // only for selected clients
        params.selectedClients = storeSelection.selectionClients
        for (const clientId of params.selectedClients) {
          reachableClientsIsLoading.value[clientId] = true
        }
      }
    } else {
      // only given client/s (maybe not selected)
      params.selectedClients = clientIds
      for (const clientId of params.selectedClients) {
        reachableClientsIsLoading.value[clientId] = true
      }
    }
    const { data, error } = await useApiGETBody<TClientReach>(
      params.selectedClients == undefined
        ? '/opsidata/clients/reachable'
        : `/opsidata/clients/reachable?selectedClients=[${params.selectedClients}]`
    )
    if (error) {
      console.error(error)
      return
    }
    for (const key in data.value) {
      const val = data.value[key]
      reachableClients.value[key] = val
    }
    if (params.selectedClients && params.selectedClients?.length > 0) {
      for (const clientId of params.selectedClients) {
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
        title: $t('opsiMessageBus'),
        message: $t('opsiMessageBus.client_updated', {
          clientId: msg.data.id,
        }),
        button: {
          label: $t('reloadPage'),
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
    warnValue: number = Infinity
  ): (rowData: any) => VNode {
    return ({ rowData }: any) => {
      function click() {
        const full_url = url + rowData.clientId
        const short_url = full_url.split('?')[0]
        const params_from_url = Object.fromEntries(
          new URLSearchParams(full_url.split('?')[1] || '')
        )
        for (const key in params_from_url) {
          try {
            params_from_url[key] = JSON.parse(params_from_url[key])
          } catch {
            // ignore if not JSON parsable
          }
        }
        // they are not passed as real types (i.e. vproducts needs the sortDesc param to be also a string..)
        router.push({ path: short_url, query: params_from_url })
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
        const _val = rowData[value] || 0
        //if (value == 'version_outdated' && type == 'LocalbootProduct') {
        //_val = Math.max(rowData[value] - rowData.version_outdated_netboot || 0, 0)
        //}
        return _val
      })
      return rowData[value] ? (
        <Button onClick={click} class="flex m-auto p-auto" title={rowData[value] + ' ' + tootltip}>
          {storeTSettings.otherSettings.clients.statisticIcons ? (
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
