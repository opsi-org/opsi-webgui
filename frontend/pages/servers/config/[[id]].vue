<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <ViewVHostConfig :type="type" :is-child="false" :id="id" />
</template>

<script setup lang="ts">
  import { usePageHelper } from '~/composables/mixins/usePageHelper'
  import type { PropTypeServerClient } from '~/types/tproptypes'

  const type = computed(() => usePageHelper().path.value[0] as PropTypeServerClient)
  const id = computed(() => (useRoute().params.id as string) || undefined)
  // const pagetype = computed(()=>useRoute().params.pagetype)
</script>
