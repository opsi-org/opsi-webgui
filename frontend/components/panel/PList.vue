<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-scrollbar max-height="70vh" class="w-full items-stretch flex ml-3">
    <p-panel class="!p-0" style="--p-panel-header-padding: 0px">
      <ul direction="vertical">
        <li v-for="item in props.data" :key="item" class="relative flex items-stretch">
          <p class="pr-8">{{ item }}</p>
          <ButtonBTNDelete v-if="emitDeleteExists" :id="item" @delete="emit('delete', item)" />
        </li>
      </ul>
    </p-panel>
  </el-scrollbar>
</template>

<script setup lang="ts">
  const thisInstance = getCurrentInstance()
  const emit = defineEmits(['delete'])
  const props = defineProps({
    data: {
      type: Object,
      required: true,
    },
  })

  const emitDeleteExists = computed(() => {
    return thisInstance?.vnode?.props?.onDelete !== undefined
  })
</script>
