<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-container class="h-screen">
    <el-header />
    <!-- do not remove header -->
    <el-main>
      <slot />
    </el-main>
    <BarBAuthFooter v-once />
  </el-container>
</template>

<script setup lang="ts">
  const settings = storeSettings()
  settings.initColormode()
  settings.initLanguage()
</script>
