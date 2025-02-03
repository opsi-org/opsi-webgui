<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div>
    <PDialog
      v-model:visible="visible"
      modal
      :header="$t('title.selection.server')"
      :style="{ width: '25rem' }"
    >
      <span
        v-if="selectionDepots.length <= 0"
        class="text-surface-500 dark:text-surface-400 block mb-8"
      >
        {{ $t('message.info.clients.noServerSelection') }}</span
      >
      <SelectSSelect
        v-model:selection="localSelectedServers"
        v-model:data="dataSorted"
        :multi-selection="selectionStore.multiSelection"
        :selected-options="
          selectionStore.multiSelection ? [configserver] : configserver
        "
        :marked-options="
          selectionStore.multiSelection ? [configserver] : configserver
        "
      />
      <div class="flex justify-end gap-2">
        <el-button @click="cancel">{{ $t('label.cancel') }}</el-button>
        <el-button type="primary" @click="save">
          {{ $t('label.select') }}
        </el-button>
      </div>
    </PDialog>
  </div>
</template>

<script setup lang="ts">
  import { useDepot, useConfigserver } from '~/composables/mixins/useGet'

  const $t = useI18n().t
  const selectionStore = storeSelections()
  const useCServer = await useConfigserver(false, undefined, $t)

  const visible = ref(true)
  const $emit = defineEmits(['refetch'])
  const props = defineProps({
    refetchOnCancel: { type: Boolean, default: false },
  })

  const { selectionDepots } = storeToRefs(selectionStore)
  const dataSorted = await useDepot($t).getDepotIdList()
  const configserver = (await useCServer.getOpsiConfigServerWithHeaders(false))
    .data
  const localSelectedServers = ref<string | string[]>(
    selectionStore.multiSelection ? [] : '',
  )
  if (configserver) {
    localSelectedServers.value = selectionStore.multiSelection
      ? [configserver]
      : configserver
  }
  // const localSelectedServers = ref<string|string[]>(configserver ? [configserver] : [])

  function save() {
    if (Array.isArray(localSelectedServers.value)) {
      selectionStore.setSelectionDepots(localSelectedServers.value)
    } else {
      selectionStore.setSelectionDepots([localSelectedServers.value])
    }
    // selectionStore.setSelectionDepots(localSelectedServers.value)
    $emit('refetch')
    visible.value = false
  }
  function cancel() {
    if (props.refetchOnCancel) {
      $emit('refetch')
    }
    visible.value = false
  }
</script>
