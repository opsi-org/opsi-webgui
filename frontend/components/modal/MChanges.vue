<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <TooltipTTooltip
    v-if="transparent === true && changesExists"
    class="box-item"
    :content="$t('button.track.changes')"
  >
    <IconIIcon
      :icon="icons.trackChanges"
      :disabled="!changesExists"
      :class="changesExists ? 'text-danger' : 'text-success'"
      :title="$t('button.track.changes')"
      @click="dialogVisible = true"
    />
  </TooltipTTooltip>
  <el-button
    v-else-if="transparent === false"
    :disabled="!changesExists"
    @click="dialogVisible = true"
    :type="changesExists ? 'danger' : 'success'"
  >
    <IconIIcon :icon="icons.trackChanges" />
    <p v-if="small === undefined || small === false">
      {{ $t('button.track.changes') }}
    </p>
  </el-button>
  <el-dialog data-testid="MTrackChangesModal" v-model="dialogVisible">
    <template #header>
      <div class="flex">
        <IconIIcon :icon="icons.info" class="min-w-5 min-h-5 mr-2" />
        <h3>
          {{ $t('title.track.changes') }}
        </h3>
      </div>
    </template>
    <el-tabs v-model="activeName" lazy>
      <el-tab-pane :label="$t('title.hostparameters')" name="1">
        <el-scrollbar
          v-if="modelValue?.changesHostParam"
          class="max-h-96 overflow-scroll mb-2rounded-lg p-2 shadow-sm"
        >
          <pre class="m-0 text-sm">{{ modelValue.changesHostParam }}</pre>
        </el-scrollbar>
        <span v-else>{{ $t('label.empty') }}</span>
      </el-tab-pane>
      <el-tab-pane
        :label="$t('title.prodactionsprops')"
        name="2"
        v-if="modelValue?.changesProducts.length > 0"
      >
        <ModalMChangesTable
          v-if="modelValue"
          v-model="modelValue.changesProducts"
        />
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup lang="ts">
  const icons = useIcons()
  const $t = useI18n().t

  const modelValue = defineModel<Record<string, any>>()
  const modelDialogVisible = defineModel<boolean>('visible', {
    type: Boolean,
    default: undefined,
  })

  const dialogVisible = ref<boolean>(
    modelDialogVisible.value ? modelDialogVisible.value : false,
  )

  const _props = defineProps({
    small: {
      type: Boolean,
      default: () => {
        return false
      },
    },
    transparent: {
      type: Boolean,
      default: () => {
        return false
      },
    },
  })

  watch(
    () => modelDialogVisible.value,
    () => {
      dialogVisible.value = modelDialogVisible.value
    },
  )
  watch(
    () => dialogVisible.value,
    () => {
      modelDialogVisible.value = dialogVisible.value
    },
  )

  const changesExists = computed(() => {
    return (
      modelValue.value?.changesHostParam?.length > 0 ||
      modelValue.value?.changesProducts?.length > 0
    )
  })
  const activeName = ref(
    modelValue.value?.changesHostParam?.length > 0 ? '1' : '2',
  )
</script>
