<script setup lang="ts">
import {loginlogout} from '~/histoire/histoire-utils'
import {generateColumns, generateData} from '~/histoire/histoire-utils-data'

const page = ref(0)
const columns = generateColumns(4)
// columns['selected'] = {key: 'selected',
//       id: 'selected',
//       parentId: null,
//       dataKey: 'selected',
//       title: `selected`,
//       fixed: true,
//       width: 50}
columns['column-0'].fixed = true
columns['column-1'].hidden = true
const data = generateData(columns, 15, '', page.value)
</script>

<template>
  <Story :setup-app="loginlogout">
    <Variant title="mobile" :meta="{ wrapperMobile: true }">
      <TableTDefaultMobile
        id="tableId"
        :columns="columns"
        :data="data"
        rowId="column-0"
        :sort-by="undefined"
        :fetch="(page: any) => generateData(columns, 10, '', page.value)"
        @selection-changed="(id: string) => {}"
        @selection-clear="() => { }"
      />
    </Variant>
  </Story>
</template>