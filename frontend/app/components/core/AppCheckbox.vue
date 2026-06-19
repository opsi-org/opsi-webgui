<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppCheckbox - UI library wrapper for checkbox rendering.
-->
<template>
  <UCheckbox v-bind="accessibleAttrs" />
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const accessibleAttrs = computed(() => withAccessibleName(attrs))
</script>
