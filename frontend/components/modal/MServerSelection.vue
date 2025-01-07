<template>
  <div>
    <PDialog
      v-model:visible="visible"
      modal
      header="Server selection"
      :style="{ width: '25rem' }"
    >
      <span
        v-if="selectionDepots.length <= 0"
        class="text-surface-500 dark:text-surface-400 block mb-8"
      >
        {{ $t('message.info.clients.noServerSelection') }}</span
      >
      <PMultiSelect
        v-if="storeSelections().multiSelection"
        v-model="localSelectedServers"
        :options="dataSorted"
        :max-selected-labels="1"
        class="w-full justify-stretch"
        show-clear
        display="chip"
      >
        <template #option="{ option }">
          <span :class="{ '!font-bold': configserver === option }">{{
            option
          }}</span>
        </template>
      </PMultiSelect>
      <PSelect
        v-else
        v-model="localSelectedServer"
        :options="dataSorted"
        class="w-full justify-stretch"
      >
        <template #option="{ option }">
          <span :class="{ '!font-bold': configserver === option }">{{
            option
          }}</span>
        </template>
      </PSelect>
      <!-- <el-select
        v-model="localSelectedServers"
        clearable
        multiple
        style="min-width: 200px"
      >
        <el-option
          v-for="item in dataSorted"
          :key="item"
          :label="item"
          :value="item"
          :class="{ '!font-bold': configserver === item }"
        />
      </el-select> -->

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

  const localSelectedServers = ref<string[]>([])
  const localSelectedServer = ref<string>()
  if (configserver) {
    localSelectedServers.value.push(configserver)
    localSelectedServer.value = configserver
  }
  function save() {
    selectionStore.setSelectionDepots(localSelectedServers.value)
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
