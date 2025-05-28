<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<script setup lang="ts">
  function initMobile() {
    const settings = storeSettings()
    settings.setIsMobile(true)
  }
  function initDesktop() {
    const settings = storeSettings()
    settings.setIsMobile(false)
  }
  const getTheme = () => {
    const settings = storeSettings()
    return settings.colormode
  }
  const getThemeDoc = () => {
    return document.querySelector('html')?.classList.contains('dark')
      ? 'dark'
      : document.querySelector('html')?.classList.contains('htw-dark')
        ? 'dark'
        : 'light'
  }
</script>

<template>
  <!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
  <Story>
    <Variant
      title="mobile"
      :meta="{ wrapperMobile: true }"
      :setup-app="initMobile"
      responsive-disabled
    >
      <LayoutLDefault>
        <el-text>
          Some content Some content Some content Some content Some content Some content Some content
          Some content Some content Some content Some content Some content Some content Some content
          Some content Some content Some content Some content Some content Some content Some content
          Some content Some content Some content Some content Some content Some content Some content
          Some content Some content Some content Some content Some content Some content Some content
          Some content Some content Some content Some content Some content Some content Some content
          Some content Some content Some content Some content Some content Some content Some content
          Some content Some content Some content Some content Some content Some content Some content
          Some content Some content
        </el-text>
        <el-text> Store: {{ getTheme() }} </el-text>
        <el-text> Doc: {{ getThemeDoc() }} </el-text>
      </LayoutLDefault>
    </Variant>
    <Variant title="desktop" responsive-disabled :setup-app="initDesktop">
      <LayoutLDefault>
        <el-text>
          Some content Some content Some content Some content Some content Some content Some content
          Some content Some content Some content Some content Some content Some content Some content
          Some content Some content Some content Some content Some content Some content Some content
          Some content Some content Some content Some content Some content Some content Some content
          Some content Some content Some content Some content Some content Some content Some content
          Some content Some content Some content Some content Some content Some content Some content
          Some content Some content Some content Some content Some content Some content Some content
          Some content Some content Some content Some content Some content Some content Some content
          Some content Some content
        </el-text>
      </LayoutLDefault>
    </Variant>
  </Story>
</template>
