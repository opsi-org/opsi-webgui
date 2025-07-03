<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div>
    <p-dialog
      v-model:visible="visible"
      modal
      :header="$t('selectServer')"
      :style="{ width: '25rem' }"
    >
      <span
        v-if="selectionDepots.length <= 0"
        class="text-surface-500 dark:text-surface-400 block mb-8"
      >
        {{ $t('message.noServerSelected') }}
      </span>
      <SelectSSelect
        v-model:selection="localSelectedServers"
        v-model:data="dataSorted"
        :multi-selection="selectionStore.multiSelection"
        :selected-options="selectionStore.multiSelection ? [configserver] : configserver"
        :marked-options="selectionStore.multiSelection ? [configserver] : configserver"
      />
      <div class="flex justify-end gap-2">
        <el-button @click="cancel">{{ $t('cancel') }}</el-button>
        <el-button variant="primary" @click="save">
          {{ $t('select') }}
        </el-button>
      </div>
    </p-dialog>
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

  const { selectionDepots, selectionDefaultDepots } = storeToRefs(selectionStore)
  const configserver = ref<string>('')
  const dataSorted = await useDepot($t).getDepotIdList()
  const localSelectedServers = ref<string | string[]>(
    selectionStore.multiSelection ? selectionDefaultDepots.value : selectionDefaultDepots.value?.[0]
  )
  onMounted(async () => {
    await initSelect()
  })

  async function initSelect() {
    // default is first item of data
    localSelectedServers.value = selectionStore.multiSelection ? [dataSorted?.[0]] : dataSorted?.[0]

    // if configserver is found, use it
    configserver.value = (await useCServer.getOpsiConfigServerWithHeaders(false)).data
    if (configserver.value || selectionDefaultDepots.value?.[0] == '<configserver>') {
      if (configserver.value == undefined) throw new Error('Configserver not found')
      localSelectedServers.value = selectionStore.multiSelection
        ? [configserver.value]
        : configserver.value
    }

    if (localSelectedServers.value?.[0] !== '<configserver>') {
      localSelectedServers.value = selectionStore.multiSelection
        ? selectionDefaultDepots.value
        : selectionDefaultDepots.value?.[0]
    }
  }
  // const localSelectedServers = ref<string|string[]>(configserver ? [configserver] : [])

  function save() {
    if (Array.isArray(localSelectedServers.value)) {
      selectionStore.setSelectionDepots(localSelectedServers.value)
    } else {
      selectionStore.setSelectionDepots([localSelectedServers.value])
    }
    // updateStorage() // currently disabled
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
<style lang="css" scoped>
  :deep(.p-dialog-close-button .p-button-label) {
    margin: 0px;
  }
</style>
