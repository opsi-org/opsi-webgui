<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-button @click="clearSelection" size="small">
    {{ $t('table.selection.clear') }}
  </el-button>
  <el-checkbox-group v-model="selectedDepots" @change="handleDepotSelection">
    <div v-for="item in depotIDList" :key="item">
      <el-checkbox size="small" :label="item" :value="item" />
    </div>
  </el-checkbox-group>
</template>

<script setup lang="ts">
  import { useDepot } from '~/composables/mixins/useGet'
  import type { T_DepotIds } from '~/types/APItypes'
  const $t = useI18n().t

  const storeSelection = storeSelections()
  const useCookie = storeTablesettings()
  const depotIDList = ref<T_DepotIds>([])
  const selectedDepots = ref<T_DepotIds>([])

  watch(
    () => storeSelection.selectionDepots,
    async () => {
      syncSelection()
    },
  )

  onMounted(async () => {
    await fetch()
    syncSelection()
  })

  async function fetch() {
    depotIDList.value = await useDepot($t).getDepotIdList()
  }

  const syncSelection = () => {
    selectedDepots.value = storeSelection.selectionDepots
  }

  const clearSelection = () => {
    storeSelection.clearSelectionDepots()
  }

  const handleDepotSelection = () => {
    storeSelection.setSelectionDepots(selectedDepots.value)
    useCookie.setSortColumn('servers', 'selected', true)
  }
</script>
