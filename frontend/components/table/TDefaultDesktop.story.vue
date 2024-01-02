<script setup lang="ts">
import {loginlogout} from '~/histoire/histoire-utils'
import {generateColumns, generateData} from '~/histoire/histoire-utils-data'
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
</script>

<template>
  <Story :setup-app="loginlogout">
      <TableTDefaultDesktop
        id="tableId"
        :columns="columns"
        :data="data"
        rowId="column-0"
        :sort-by="undefined"
        @selection-changed="(id: any) => {}"
        @selection-clear="() => { }"
      />
  </Story>
</template>