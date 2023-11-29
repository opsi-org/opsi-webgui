<script setup lang="ts">
import {loginlogout} from '~/histoire-utils'
import type { ITableHeaderRow } from '~/types/ttableV3';

const columns = ref<ITableHeaderRow>({
  column1: {key: 'column1', dataKey:'column1', title: 'column1', width: 150},
  column2: {key: 'column2', dataKey:'column2', title: 'column2', width: 150},
  column3: {key: 'column3', dataKey:'column2', title: 'column3', width: 150}
})
const data = ref<Array<any>>([
  {column1: 'row1-column1', column2: 'row1-column2', column3: 'row1-column3'},
  {column1: 'row2-column1', column2: 'row2-column2', column3: 'row2-column3'},
  {column1: 'row3-column1', column2: 'row3-column2', column3: 'row3-column3'},
])
</script>

<template>
  <Story :setup-app="loginlogout">
    <TableTDefault id="tableId" :columns="columns" :data="data"/>
  </Story>
</template>