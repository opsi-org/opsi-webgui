<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-popover
    :placement="placement"
    :title="title"
    :width="width"
    :trigger="trigger as any"
    :content="content"
  >
    <template #reference>
      <el-button size="small" circle text :class="$attrs.class">
        <IconIIcon :icon="icons.help" />
      </el-button>
    </template>
  </el-popover>
</template>

<script setup lang="ts">
  const icons = useIcons()

  const _props = defineProps({
    title: { type: String, default: undefined },
    content: { type: String, required: true },
    width: { type: Number, default: 200 },
    trigger: { type: String, default: 'hover' },
    placement: { type: String, default: 'top-start' },
  })
</script>
