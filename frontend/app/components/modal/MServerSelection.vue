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
        :selected-options="configserverTyped"
        :marked-options="configserverTyped"
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
  const configserverTemplate = ref<string>($t('configserverTemplate', { id: 'not found' }))
  const selectionStore = storeSelections()
  const useCServer = await useConfigserver(false, undefined, $t)

  const visible = ref(true)
  const $emit = defineEmits(['refetch'])
  const props = defineProps({
    refetchOnCancel: { type: Boolean, default: false },
  })

  const { selectionDepots, selectionDefaultDepots } = storeToRefs(selectionStore)
  const configserver = ref<string>((await useCServer.getOpsiConfigServerWithHeaders(false)).data)
  const dataSorted = ref<string[]>([])
  const localSelectedServers = ref<string | string[]>(
    selectionStore.multiSelection ? selectionDefaultDepots.value : selectionDefaultDepots.value?.[0]
  )
  onMounted(async () => {
    await initOptions()
  })

  const configserverTyped = computed(() => {
    return selectionStore.multiSelection
      ? [$t('configserverTemplate', { id: configserver.value })]
      : $t('configserverTemplate', { id: configserver.value })
  })
  async function initOptions() {
    configserverTemplate.value = $t('configserverTemplate', { id: configserver.value })
    dataSorted.value = [...(await useDepot($t).getDepotIdList()), configserverTemplate.value]
    if (
      // replace configserver with configserverTemplate
      dataSorted.value.includes(configserver.value) &&
      dataSorted.value.includes(configserverTemplate.value)
    ) {
      dataSorted.value = dataSorted.value.filter((item) => item !== configserver.value)
    }
    dataSorted.value.sort((a, b) => {
      // sort so that configserverTemplate is always at the beginning, and the rest is alphabetically sorted
      if (a === configserverTemplate.value) return -1
      if (b === configserverTemplate.value) return 1
      return a.localeCompare(b)
    })
  }
  async function save() {
    if (Array.isArray(localSelectedServers.value)) {
      // replace configserverTemplate with configserver
      if (localSelectedServers.value.includes(configserverTemplate.value)) {
        localSelectedServers.value = localSelectedServers.value.filter(
          (item) => item !== configserverTemplate.value
        )
        localSelectedServers.value.push(configserver.value)
      }
      selectionStore.setSelectionDepots(localSelectedServers.value)
    } else {
      // replace configserverTemplate with configserver
      if (localSelectedServers.value == configserverTemplate.value) {
        localSelectedServers.value = configserver.value
      }
      selectionStore.setSelectionDepots([localSelectedServers.value])
    }
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
