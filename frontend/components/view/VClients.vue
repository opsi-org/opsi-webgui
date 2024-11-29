<template>
    <TableTTable
      :row-id="rowId"
      has-client-actions
      action-clone="/clients/client/clone/"
      action-log="/clients/client/logs/"
      action-config="/clients/client/config/"
      :table-column="tableColumn"
      :fetch="fetchClients"
      @selection-changed="(id: string) => {storeSelection.toggleSelectionClients(id)}"
      @clear-selection="storeSelection.clearSelectionClients"
    />
</template>


<script setup lang="tsx">
  import type { T_ClientsList } from '~/types/APItypes';
  import {useIcons} from '../../composables/mixins/useIcons'
  import { useNotification } from '~/composables/mixins/useComponent';

  const { notifyError } = useNotification()
  const $t = useI18n().t
  const icons = useIcons()
  const router = useRouter()

  const storeSelection = storeSelections()


  const rowId = 'clientId'
  const tableColumn = ref([
    {title: $t('table.fields.selection'), key: 'selected', sortable: true, type: 'selection', visible: true, alwaysVisible: true, width:"60px",

    // headerCellRenderer: () => { return  <buttonBTNClearSelection onClearselection={storeSelection.clearSelectionClients} /> },

      cellRenderer: ({rowData}: any) => {
        rowData.selected = storeSelection.selectionClients.includes(rowData.clientId)
        return (<> { storeSelection.multiSelection ?
          <el-checkbox v-model={rowData.selected} class="selectionItem" />
        :
          <el-radio-group v-model={rowData.selected}>
            <el-radio value={true} class="selectionItem hide_label" />
          </el-radio-group>
        }</>)
      }},
    {title: $t('table.fields.id'), key: 'clientId', sortable: true, visible: true, alwaysVisible: true, filter: true},
    {title: $t('table.fields.mac'), key: 'macAddress', sortable: false, visible: false},
    {title: $t('table.fields.ip'), key: 'ipAddress', sortable: true, visible: false},
    {title: $t('table.fields.description'), key: 'description', sortable: false, visible: false},
    {title: 'notes', key: 'notes', sortable: true, visible: false},
    {title: $t('table.fields.lastSeen'), key: 'lastSeen', sortable: true, visible: false},
    {title: $t('table.fields.uefi'), key: 'uefi', sortable: true, visible: false},

    {title: $t('table.fields.versionOutdatedGeneral'), key: 'version_outdated', sortable: true, visible: true, alwaysVisible: true, width:"60px", icon:icons.productsOutdated, cellRenderer:
    getStatisticRenderer('/clients/products/LocalbootProduct?sortby=version&selectedClient=', 'version_outdated')
  },
  {title: $t('table.fields.versionOutdatedNetboot'), key: 'version_outdated_netboot', sortable: true, visible: true, alwaysVisible: true, width:"60px", icon:icons.productsOutdated, cellRenderer:
  getStatisticRenderer('/clients/products/NetbootProduct?sortby=version&selectedClient=', 'version_outdated')},
  {title: $t('table.fields.installationStatusUnknown'), key: 'installationStatus_unknown', sortable: true, visible: true, alwaysVisible: true, width:"60px", icon:icons.productInstallationStatusUnknown,
  cellRenderer: getStatisticRenderer('/clients/products/LocalbootProduct?sortby=installationStatus&selectedClient=', 'installationStatus_unknown') },
  {title: $t('table.fields.installationStatus_installed'), key: 'installationStatus_installed', sortable: true, visible: true, alwaysVisible: true, width:"60px", icon:icons.product,
  cellRenderer: getStatisticRenderer('/clients/products/LocalbootProduct?sortby=installationStatus&selectedClient=', 'installationStatus_installed')
  },
  {title: $t('table.fields.actionResultFailed'), key: 'actionResult_failed', sortable: true, visible: true, alwaysVisible: true, width:"60px", icon:icons.productsFailedActionResult,
    cellRenderer: getStatisticRenderer('/clients/products/LocalbootProduct?sortby=actionResult&selectedClient=', 'actionResult_failed')},
  {title: $t('table.fields.actionResult_successful'), key: 'actionResult_successful', sortable: true, visible: true, alwaysVisible: true, width:"60px", icon:icons.productActionResultSuccessful,
  cellRenderer: getStatisticRenderer('/clients/products/LocalbootProduct?sortby=actionResult&selectedClient=', 'actionResult_successful')},
  {title: $t('table.fields.reachable'), key: 'reachable', sortable: false, visible: true, alwaysVisible: true, width:"60px"},
  {title: $t('table.fields.rowactions'), key: 'actions', sortable: false, visible: true, alwaysVisible: true, width:"170px"},
  ])


  async function fetchClients(params: any) {
    params.selected = JSON.stringify(storeSelection.selectionClients)
    params.selectedDepots = JSON.stringify(storeSelection.selectionDepots)

    const {data, error, headers} = await useApiGETBody<T_ClientsList>('/opsidata/clients', params)
    if (error) {
      console.error(error)
      notifyError({ message: error?.response?.data?.message || $t('message.error.generic') })
      return
    }
    if (data.value == undefined) {
      console.error("empty response. data.value undefined")
      notifyError({ message: $t('message.error.empty-response') })
      return
    }
    console.log("data fetched")
    return { data: data.value, total: parseInt(headers.get('x-total-count') || '0') }
  }

  function getStatisticRenderer(url: string, value: string): (rowData: any) => VNode {
    return ({rowData}:any) => {
      const click = () => {router.push(url + rowData.clientId)}
      return <el-tag class="cursor-pointer" onClick={click}> {rowData[value]} </el-tag>
    }
  }

</script>