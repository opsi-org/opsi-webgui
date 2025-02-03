<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <Icon :icon="icon" v-bind="$attrs" :class="$attrs.class" />
</template>

<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  const _props = defineProps({
    icon: {
      type: String,
      required: true,
    },
  })
</script>
