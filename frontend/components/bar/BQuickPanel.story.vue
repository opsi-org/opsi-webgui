<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<script setup lang="ts">
  import { loginlogout } from '~/histoire/histoire-utils'
  import { useConfigserver } from '~/composables/mixins/useGet'
  const store = ref<any>({ selectionDepots: [] })
  async function init(data: any) {
    await loginlogout(data)
    await useConfigserver(true, store)
  }
</script>
<template>
  <Story :setup-app="init">
    <Variant title="mobile" :meta="{ wrapperMobile: true }" responsive-disabled>
      <BarBQuickPanel />
    </Variant>
    <Variant title="desktop" responsive-disabled>
      <BarBQuickPanel />
    </Variant>
  </Story>
</template>
