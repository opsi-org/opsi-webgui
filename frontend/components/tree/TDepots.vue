<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <p-button
    :disabled="selectedDepots.length <= 0"
    @click="
      () => {
        clearSelection()
        selectedDepot = ''
      }
    "
    size="small"
    severity="primary"
    variant="outlined"
    :label="$t('clearAllSelections')"
  />
  <div class="flex items-center gap-2" v-for="item in depotIDList" :key="item">
    <p-checkbox
      v-if="storeSelection.multiSelection"
      name="cb-server"
      size="small"
      v-model="selectedDepots"
      :label="item"
      :value="item"
      :input-id="'cb-item-' + item"
      @change="handleDepotSelection"
    />
    <p-radio-button
      v-else
      v-model="selectedDepot"
      name="cb-server"
      size="small"
      :label="item"
      :value="item"
      :input-id="'cb-item-' + item"
      @change="handleDepotSelection"
    />
    <label :for="'cb-item-' + item"> {{ item }} </label>
  </div>
</template>

<script setup lang="ts">
  import { useDepot } from '~/composables/mixins/useGet'
  import type { T_DepotIds } from '~/types/APItypes'
  const $t = useI18n().t

  const storeSelection = storeSelections()
  const useCookie = storeTablesettings()
  const depotIDList = ref<T_DepotIds>([])
  const selectedDepots = ref<T_DepotIds>([])
  const selectedDepot = ref<string>(storeSelection.selectionDepots[0])

  watch(
    () => storeSelection.selectionDepots,
    async () => {
      syncSelection()
    },
    { deep: true }
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
    if (selectedDepots.value.length >= 1) selectedDepot.value = storeSelection.selectionDepots[0]
  }

  const clearSelection = () => {
    storeSelection.clearSelectionDepots()
  }

  const handleDepotSelection = () => {
    if (storeSelection.multiSelection) {
      storeSelection.setSelectionDepots(selectedDepots.value)
    } else {
      storeSelection.setSelectionDepots([selectedDepot.value])
    }
    useCookie.setSortColumn('servers', 'selected', true)
  }
</script>
