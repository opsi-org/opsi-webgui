<template>
  <TableTTable
    :row-id="rowId"
    :table-column="tableColumn"
    :fetch="fetchServer"
    action-config="/servers/server/config/"
    @selection-changed="(id: string) => {storeSelection.toggleSelectionDepots(id)}"
  />
</template>


<script setup lang="tsx">
import type { T_ServerList } from '~/types/APItypes';
// import {useIcons} from '../../composables/mixins/useIcons'
import { useNotification } from '~/composables/mixins/useComponent';

const { notifyError } = useNotification()
const $t = useI18n().t
// const icons = useIcons()
// const router = useRouter()

const storeSelection = storeSelections()

const emit = defineEmits(['change'])
const _props = defineProps({
  isMobile: { type: Boolean, default: ()=> {return useMQ().isMobile.value}},
})
const rowId = 'depotId'
const tableColumn = ref([
  {title: 'selected', key: 'selected', sortable: true, type: 'selection', visible: true, alwaysVisible: true,
    headerCellRenderer: () => { return  <buttonBTNClearSelection onClearselection={storeSelection.clearSelectionDepots} /> },
    cellRenderer: ({rowData}: any) => {
      rowData.selected = storeSelection.selectionDepots.includes(rowData[rowId])
      return (<> { storeSelection.multiSelection ?
        <el-checkbox v-model={rowData.selected} class="selectionItem" />
      :
        <el-radio-group v-model={rowData.selected}>
          <el-radio value={true} class="selectionItem hide_label" />
        </el-radio-group>
      }</>)
    }},
  {title: 'depotId', key: 'depotId', sortable: true, visible: true, alwaysVisible: true, filter: true,
  cellRenderer: ({rowData}: any) => {
    return <>{ rowData.type === 'OpsiConfigserver' ? <el-text> <b>{rowData.depotId}</b></el-text>
    : <el-text>{rowData.depotId}</el-text>
    }</>
  }},
  {title: 'description', key: 'description', sortable: false, visible: true},
  {title: 'type', key: 'type', sortable: true, visible: true, cellRenderer: ({rowData}: any) => {
    return <>{ rowData.type === 'OpsiConfigserver' ? <el-text> <b>{rowData.type}</b></el-text>
    : <el-text>{rowData.type}</el-text>
    }</>
  }},
  {title: 'ip', key: 'ip', sortable: true, visible: false},
  {title: 'actions', key: 'actions', sortable: false, visible: true, alwaysVisible: true, width:"150px"},
  ])


  async function fetchServer(_params: any) {
    const params = { ..._params, selected: '' }
    if (params.sortBy === '') { params.sortBy = 'depotId' }
    if (params.sortBy === 'selected') {
      params.sortDesc = true
      params.selected = JSON.stringify([])
    }

    const {data, error, headers } = await useApiGETBody<T_ServerList>('/opsidata/depots', params)
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      return []
    }
    if (data.value == undefined) {
      notifyError({ message: $t('message.error.empty-response', { details: "Servers" }) })
      return []
    }

  const opsiconfigserver = storeCache().opsiconfigserver
  if (opsiconfigserver){
    storeSelection.pushToSelectionDepots(opsiconfigserver)
    emit('change', opsiconfigserver)
  } else{
    storeSelection.pushToSelectionDepots(data.value[0].depotId)
    emit('change', data.value[0].depotId)
  }
  for (const dId of storeSelection.selectionDepots) {
    data.value.filter((row:any) => {
      return row.depotId === dId
    }).forEach((row:any) => {
      row.selected = true
    })
  }
    return { data: data.value, total: parseInt(headers.get('x-total-count') || '0') }
  }
</script>