<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div>
    <TableTTableMobile
      v-if="isMobileWrapper"
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
    sortDesc: { type: Boolean, default: false },
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

  async function fetchWrapper() {
    if (isMobileWrapper.value) {
      await tableMobile.value?.refetch()
    } else {
      await tableDesktop.value?.refetch()
    }
  }
  const hasRowsWrapper = computed(() => {
    if (isMobileWrapper.value) {
      return tableMobile.value?.hasRows
    } else {
      return tableDesktop.value?.hasRows
    }
  })

  function dataWrapper() {
    if (isMobileWrapper.value) {
      return tableMobile.value?.fetchedData
    } else {
      return tableDesktop.value?.fetchedData
    }
  }

  defineExpose({
    refetch: fetchWrapper,
    fetchedData: dataWrapper,
    hasRows: hasRowsWrapper,
  })
</script>
