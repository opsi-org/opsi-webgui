<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div data-testid="IChangesTableFilter">
    <el-input
      v-model="modelFilter"
      :aria-label="placeholder"
      :placeholder="placeholder"
    >
      <template #prefix>
        <IconIIcon :icon="icons.filter" />
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
  const icons = useIcons()
  const modelFilter = defineModel<string>()
  const _props = defineProps<{
    placeholder: string
  }>()
</script>
