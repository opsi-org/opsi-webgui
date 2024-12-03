<template>
  <div>
    <TableTTableMobile
      v-if="isMobile"
      ref="tableMobile"
      v-bind="props"
      :table-column="tableColumn"
      :fetch="fetch"
      @selection-changed="$emit('selectionChanged', $event)"
      @clear-selection="$emit('clearSelection')"
    />
    <TableTTableDesktop
      v-else
      ref="tableDesktop"
      v-bind="props"
      :table-column="tableColumn"
      :fetch="fetch"
      @selection-changed="$emit('selectionChanged', $event)"
      @clear-selection="$emit('clearSelection')"
    >
      <template #header> <slot name="header" /> </template>
      <template #toolbar-right> <slot name="toolbar-right" /> </template>
    </TableTTableDesktop>
  </div>
</template>

<script setup lang="tsx">
  import type TTableDesktop from './TTableDesktop.vue'
  import type TTableMobile from './TTableMobile.vue'

  const props = defineProps({
    isMobile: { type: Boolean, default: false, required: false },
    rowId: { type: String, required: true },
    tableColumn: { type: Array<any>, required: true },
    fetch: { type: Function, required: true },
    bodyHeight: { type: String, default: '80vh', required: false },
    sortBy: { type: String, default: undefined, required: false },
    actionClone: { type: Function, default: undefined, required: false },
    actionLog: { type: Function, default: undefined, required: false },
    actionConfig: { type: Function, default: undefined, required: false },
    hasClientActions: { type: Boolean, default: false, required: false },
  })

  const $emit = defineEmits(['selectionChanged', 'clearSelection'])
  const tableMobile = ref<typeof TTableMobile>()
  const tableDesktop = ref<typeof TTableDesktop>()

  const isMobileWrapper = ref<boolean>(props.isMobile)
  watch(
    () => useMQ().isMobile,
    () => {
      isMobileWrapper.value = useMQ().isMobile.value
    },
    { deep: true },
  )

  defineExpose({ refetch: fetchWrapper, fetchedData: dataWrapper })

  async function fetchWrapper() {
    if (isMobileWrapper.value) {
      await tableMobile.value?.refetch()
    } else {
      await tableDesktop.value?.refetch()
    }
  }

  function dataWrapper() {
    if (isMobileWrapper.value) {
      return tableMobile.value?.fetchedData
    } else {
      return tableDesktop.value?.fetchedData
    }
  }
</script>
