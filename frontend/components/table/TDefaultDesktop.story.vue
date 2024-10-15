<script setup lang="ts">
import {loginlogout} from '~/histoire/histoire-utils'
import {generateColumns, generateData, generateTableData} from '~/histoire/histoire-utils-data'
// import type { ITableHeaderRow } from '~/types/ttableV3';
const selected = {
  key: 'selected',
  dataKey: 'selected',
  title: `selected`,
  fixed: true,
  width: 50
}
const columns: any = { selected, ...generateColumns(4) }

columns['column-0'].fixed = true
columns['column-1'].hidden = true
const data = generateData(columns, 100)

const tableData = generateTableData('column-0')
const totalItems = data.length
</script>

<template>
  <Story :setup-app="loginlogout" :layout="{ type: 'grid', width: '100%'}">
    <Variant title="PrimeVue">
      <TableTDefaultDesktopPV
        id="tableId"
        v-model:columns="columns"
        v-model:data="data"
        :table-data="tableData"
        :total-items="totalItems"

        row-id="column-0"
        :sort-by="undefined"
        @selection-changed="(id: any) => {}"
        @selection-clear="() => { }"
      />
    </Variant>
    <Variant title="Element+">
      <TableTDefaultDesktop
      id="tableId"
      v-model:columns="columns"
      v-model:data="data"
      :table-data="tableData"
      :total-items="totalItems"

      row-id="column-0"
      :sort-by="undefined"
      @selection-changed="(id: any) => {}"
      @selection-clear="() => { }"
      />
    </Variant>
  </Story>
</template>