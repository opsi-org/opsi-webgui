<template>
  <h1>{{ id }}</h1>

  <DropdownDDTableColumnVisibility :table-id="id" v-model:headers="headerData" :sort-by="sortBy" :multi="true" :incontextmenu="true" />
  <el-text>{{ headerData.description }}</el-text>
  <div class="h-screen w-screen">
    <el-auto-resizer>
      <template #default="{ height, width }">
        <el-table-v2
          :columns="Object.values(headerData)"
          :data="fetchResult"
          :width="width"
          :height="height"
          fixed
          />
      </template>
    </el-auto-resizer>
  </div>
  <pre>
    {{ fetchResult }}
  </pre>
</template>


<script lang="ts" setup>
import { useNotification } from '~/composables/mixins/useComponent';
import type { ITableHeaderRow } from '~/types/ttableV3'

import { useCookies } from '~/composables/mixins/useCookies'
import { TableV2FixedDir } from 'element-plus';
const cookies = useCookies()
const $t = useI18n().t
const props = defineProps({
  id: { type: String, default: 'depots' },
})
const fetchResult = ref<Array<any>>([])
const headerData = reactive<ITableHeaderRow>({
    selected: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.selection'),
      key: 'selected',
      dataKey: 'selected',
      fixed: true,
      sortable: true,
      width: 50,
      maxWidth: 50,
      hidden: !cookies.includesCookie('column_' + props.id, 'selected', true)
    },
    depotId: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.id'),
      key: 'depotId',
      dataKey: 'depotId',
      fixed: true,
      sortable: true,
      width: 150,
      maxWidth: 350,
      hidden: !cookies.includesCookie('column_' + props.id, 'depotId', true)
    },
    description: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.description'),
      key: 'description',
      dataKey: 'description',
      sortable: true,
      width: 150,
      hidden: !cookies.includesCookie('column_' + props.id, 'description', false)
    },
    type: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.type'),
      key: 'type',
      dataKey: 'type',
      sortable: true,
      width: 140,
      maxWidth: 300,
      hidden: !cookies.includesCookie('column_' + props.id, 'type', true)
    },
    ip: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.ip'),
      key: 'ip',
      dataKey: 'ip',
      sortable: true,
      width: 100,
      maxWidth: 150,
      hidden: !cookies.includesCookie('column_' + props.id, 'ip', false)
    },
    rowactions: { // eslint-disable-next-line object-property-newline
      key: 'rowactions',
      dataKey: 'rowactions',
      title: $t('table.fields.rowactions'),
      fixed: TableV2FixedDir.RIGHT,
      width: 100,
      maxWidth: 100,
      hidden: !cookies.includesCookie('column_' + props.id, 'rowactions', false),
      class: 'col-rowactions'
    }
})
const sortBy = ref('depotId')
onMounted(async ()=>{
  const tableData = {
    pageNumber: 1,
    perPage: 20,
    sortBy: 'depotId', // this.getKeyCookie('sorting_' + props.id, 'sortBy', 'depotId'),
    sortDesc: false, // this.getKeyCookie('sorting_' + props.id, 'sortDesc', false),
    filterQuery: ''
  }
  const params = { ...tableData, selected: '' }

  if (params.sortBy === '') { params.sortBy = 'depotId' }
  if (params.sortBy === 'selected') {
    params.sortDesc = true
    params.selected = JSON.stringify([])
  }
  const {data, error} = await useApiGETBody('/opsidata/depots', params)
  '/api/opsidata/depots'
  if (error) {
    console.log(error)
    useNotification().error(error)
    return
  }
  console.log('Fetchresult data', data)
  fetchResult.value = data.value;
  console.log('Fetchresult data2', fetchResult.value)

})
</script>