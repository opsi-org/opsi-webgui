<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-button
    v-if="emitDeleteExists"
    size="small"
    class="!border-none !p-1 absolute top-0 right-0"
    :title="props.id ? $t('deselectItem', { item: props.id }) : $t('deselect')"
  >
    <span class="sr-only">{{ $t('deselect') }}</span>
    <IconIIcon :icon="icons.x" @click="emit('delete')" />
  </el-button>
</template>

<script setup lang="ts">
  const thisInstance = getCurrentInstance()
  const icons = useIcons()
  const emit = defineEmits(['delete'])
  const props = defineProps({
    id: {
      type: String,
      required: false,
      default: undefined,
    },
  })

  const emitDeleteExists = computed(() => {
    return (
      thisInstance?.vnode?.props?.delete !== undefined ||
      thisInstance?.vnode?.props?.onDelete !== undefined
    )
  })
</script>
