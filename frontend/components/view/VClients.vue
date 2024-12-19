<template>
  <TableTTable
    ref="clientsRef"
    :row-id="rowId"
    :is-mobile="isMobile"
    has-client-actions
    :action-clone="(rowData: any) => `/clients/client/clone/${rowData[rowId]}`"
    :action-log="(rowData: any) => `/clients/client/logs/${rowData[rowId]}`"
    :action-config="(rowData: any) => `/clients/client/config/${rowData[rowId]}`"
    :sort-by="rowId"
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
    </template>
  </TableTTable>
</template>

<script setup lang="tsx">
  import type { T_ClientsList } from '~/types/APItypes'
  import { useIcons } from '../../composables/mixins/useIcons'
  import { useNotification } from '~/composables/mixins/useComponent'
  import { useMBus } from '~/composables/mixins/useMessagebus'

  import Checkbox from 'primevue/checkbox'
  import RadioButton from 'primevue/radiobutton'
  import Button from 'primevue/button'
  import TTooltip from '../tooltip/TTooltip.vue'
  // import { Popover } from 'primevue'

  const { notifyError, notifyInfo } = useNotification()
  const $t = useI18n().t
  const icons = useIcons()
  const router = useRouter()
  const _msgbus = useMBus(wsBusMsgObjectChanged, false, $t)

  const storeSelection = storeSelections()
  const { msgbusAutoRefresh } = storeToRefs(storeSettings())

  const _props = defineProps({
    isMobile: {
      type: Boolean,
      default: () => {
        return false
      },
    },
  })

  const rowId = 'clientId'
  const clientsRef = ref()
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
      sortable: true,
      visible: true,
      alwaysVisible: true,
      filter: true,
    },
    {
      title: $t('table.fields.mac'),
      key: 'macAddress',
      sortable: true,
      visible: false,
    },
    {
      title: $t('table.fields.ip'),
      key: 'ipAddress',
      sortable: true,
      visible: false,
    },
    {
      title: $t('table.fields.description'),
      key: 'description',
      sortable: true,
      visible: false,
    },
    { title: 'notes', key: 'notes', sortable: true, visible: false },
    {
      title: $t('table.fields.lastSeen'),
      key: 'lastSeen',
      sortable: true,
      visible: false,
    },
    {
      title: $t('table.fields.uefi'),
      key: 'uefi',
      sortable: true,
      visible: false,
    },

    {
      title: $t('table.fields.versionOutdatedGeneral'),
      key: 'version_outdated',
      sortable: true,
      visible: true,
      alwaysVisible: true,
      width: '60px',
      icon: icons.productsOutdated,
      cellRenderer: getStatisticRenderer(
        $t('table.fields.versionOutdatedGeneral'),
        '/clients/products/LocalbootProduct?sortby=version&selectedClient=',
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
      sortable: true,
      visible: true,
      alwaysVisible: true,
      width: '60px',
      icon: icons.productsOutdated,
      cellRenderer: getStatisticRenderer(
        $t('table.fields.versionOutdatedNetboot'),
        '/clients/products/NetbootProduct?sortby=version&selectedClient=',
        'version_outdated',
        'version',
        'NetbootProduct',
        Infinity,
        1,
      ),
    },
    {
      title: $t('table.fields.installationStatusUnknown'),
      key: 'installationStatus_unknown',
      sortable: true,
      visible: true,
      alwaysVisible: true,
      width: '60px',
      icon: icons.productInstallationStatusUnknown,
      cellRenderer: getStatisticRenderer(
        $t('table.fields.installationStatusUnknown'),
        '/clients/products/LocalbootProduct?sortby=installationStatus&selectedClient=',
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
      sortable: true,
      visible: true,
      alwaysVisible: true,
      width: '60px',
      icon: icons.product,
      cellRenderer: getStatisticRenderer(
        $t('table.fields.installationStatus_installed'),
        '/clients/products/LocalbootProduct?sortby=installationStatus&selectedClient=',
        'installationStatus_installed',
        'installationStatus',
      ),
    },
    {
      title: $t('table.fields.actionResultFailed'),
      key: 'actionResult_failed',
      sortable: true,
      visible: true,
      alwaysVisible: true,
      width: '60px',
      icon: icons.productsFailedActionResult,
      cellRenderer: getStatisticRenderer(
        $t('table.fields.actionResultFailed'),
        '/clients/products/LocalbootProduct?sortby=actionResult&selectedClient=',
        'actionResult_failed',
        'actionResult',
        undefined, // type
        1, // errorValue
        Infinity, // warnValue
      ),
    },
    {
      title: $t('table.fields.actionResult_successful'),
      key: 'actionResult_successful',
      sortable: true,
      visible: true,
      alwaysVisible: true,
      width: '60px',
      icon: icons.productActionResultSuccessful,
      cellRenderer: getStatisticRenderer(
        $t('table.fields.actionResult_successful'),
        '/clients/products/LocalbootProduct?sortby=actionResult&selectedClient=',
        'actionResult_successful',
        'actionResult',
      ),
    },
    {
      title: $t('table.fields.reachable'),
      key: 'reachable',
      sortable: true,
      visible: true,
      alwaysVisible: true,
      width: '60px',
    },
    {
      title: $t('table.fields.rowactions'),
      key: 'actions',
      sortable: false,
      visible: true,
      alwaysVisible: true,
      width: '170px',
    },
  ])

  async function fetchClients(params: any) {
    params.selected = JSON.stringify(storeSelection.selectionClients)
    params.selectedDepots = JSON.stringify(storeSelection.selectionDepots)

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
    url: string,
    value: string,
    sortbyKey: string,
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
            currentRoute.includes('sortby=' + sortbyKey) &&
            currentRoute.includes('selectedClient=' + rowData.clientId) &&
            currentRoute.includes('/' + type + '?')
          )
        }
        return (
          currentRoute.includes('sortby=' + sortbyKey) &&
          currentRoute.includes('selectedClient=' + rowData.clientId)
        )
      })
      const severity = computed(() => {
        if (checked.value) return 'primary'
        if (rowData[value] >= errorValue) return 'danger'
        if (rowData[value] >= warnValue) return 'warn'
        return 'success'
      })
      return rowData[value] ? (
        <TTooltip
          v-slots={{
            default: () => (
              <Button
                badge={(rowData[value] || 0) + ''}
                badgeSeverity={severity.value}
                onClick={click}
                class="!inline !bg-transparent !m-0 !p-0 !border-0"
              />
            ),
            tooltip: () => rowData[value] + ' ' + tootltip,
          }}
        />
      ) : (
        <span />
      )
    }
  }
</script>
