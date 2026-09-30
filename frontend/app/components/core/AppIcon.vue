<!--
  This file is part of the OPSI-WebGUI application.
  OPSI-WebGUI is the web-based management interface for OPSI.
https://opsi.org/en/

  Copyright (c) UIB GmbH info@uib.de 2026
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
