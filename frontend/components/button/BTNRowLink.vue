<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-button
    :class="{
      'bg-opsi-blue': props.isPressed,
      'm-0': true,
    }"
    data-testid="BTNRowLink"
    @click.stop="emit('onClick')"
  >
    <iconIIcon :icon="props.icon" />
  </el-button>
</template>

<script setup lang="ts">
  const emit = defineEmits(['onClick'])
  const props = defineProps({
    icon: { type: String, default: useIcons().settings },
    isPressed: { type: Boolean, default: false },
    link: { type: String, default: '' },
  })
</script>
