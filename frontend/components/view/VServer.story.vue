<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<script setup lang="ts">
  import { loginlogout } from '~/histoire/histoire-utils'
</script>

<template>
  <Story :setup-app="loginlogout">
    <Variant title="mobile" :meta="{ wrapperMobile: true }" responsive-disabled>
      <ViewVServer :is-mobile="true" />
    </Variant>
    <Variant title="desktop" responsive-disabled>
      <ViewVServer :is-mobile="false" />
    </Variant>
  </Story>
</template>
