<script setup lang="ts">
import {loginlogout} from '~/histoire/histoire-utils'
import {generateColumns, generateData} from '~/histoire/histoire-utils-data'
import type { ITableHeaderRow } from '~/types/ttableV3';

const columns = generateColumns(4)
columns['selected'] = {key: 'selected',
      id: 'selected',
      parentId: null,
      dataKey: 'selected',
      title: `selected`,
      fixed: true,
      width: 50}
columns['column-0'].fixed = true
columns['column-1'].hidden = true
const data = generateData(columns, 100)
</script>

<template>
  <Story :setup-app="loginlogout">
      <TableTDefaultMobile
        id="tableId"
        :columns="columns"
        :data="data"
        rowId="column-0"
        :sort-by="undefined"
        @selection-changed="(id) => {}"
        @selection-clear="() => { }"
      />
  </Story>
</template>