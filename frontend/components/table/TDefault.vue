<template>
  mq {{  useMQ().$mq.value }} <br />
  <TableTDefaultMobile v-if="useMQ().$mq.value == 'mobile'" v-bind="props" />
  <TableTDefaultDesktop v-else v-bind="props" />

</template>


<script lang="ts" setup>
import type { ITableHeaderRow } from '~/types/ttableV3';

const props = defineProps({
  columns: { type: Object as PropType<ITableHeaderRow>, required:true},
  data: { type: Array<any>, required:true},
  id: { type: String, default: 'depots' },
  rowId: { type: String, default: 'depotId'},
  sortBy: { type: String, default: 'selection'}
})
const $emit = defineEmits(['selection-changed', 'selection-clear'])
</script>

<style scoped>
</style>