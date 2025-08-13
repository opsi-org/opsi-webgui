<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-tooltip
    data-testid="TTooltip"
    ref="popoverRef"
    id="popover"
    raw-content
    :effect="colormode !== 'dark' ? 'dark' : 'light'"
    :trigger="props.method"
    :show-after="props.delay"
    :disabled="props.disabled"
  >
    <div>
      <slot name="default" />
    </div>
    <template #content>
      <el-text v-if="props.content">
        <Markdown :source="props.content" />
      </el-text>
      <slot name="tooltip" />
    </template>
  </el-tooltip>
</template>

<script lang="ts" setup>
  /**
   * Using element plus tooltip component, cause
   * * primevue tooltip is a directive and does not support raw content / html content
   * * primevue popover does not support a delay (even with debounce/delay workaround)
   */
  import Markdown from 'vue3-markdown-it' // this module exists and needs to be imported // no need to import as Module/Plugin

  type TMethod = 'hover' | 'click'
  const { colormode } = storeToRefs(storeSettings())

  const props = defineProps({
    disabled: { type: Boolean, default: false },
    method: { type: String as PropType<TMethod>, default: 'hover' },
    content: { type: String, default: '', required: false },
    delay: { type: Number, default: 1000 },
  })
</script>
<style scoped>
  :deep(.el-tooltip__trigger) {
    display: flex;
  }
</style>
