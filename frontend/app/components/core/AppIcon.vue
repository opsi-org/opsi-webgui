<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppIcon - UI library wrapper for icon rendering.
-->
<template>
  <UIcon v-bind="$attrs" :name="name" />
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })
defineProps<{ name: string }>()
</script>
