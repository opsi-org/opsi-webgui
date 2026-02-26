<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <main class="flex-1 flex items-center justify-center">
      <slot />
    </main>
    <footer class="bg-opsi-blue text-white h-12 flex items-center justify-between px-6 text-sm">
      <img src="~/assets/images/uib_logo_wide_dark.svg" alt="OPSI by uib GmbH" class="h-7" />
      <div class="flex items-center gap-2">
        <UiThemeToggle />
        <UiLanguageDropdown direction="up" />
      </div>
      <span class="opacity-80">v{{ $config.public.packageVersion || '1.0.0' }}</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
const $config = useRuntimeConfig()
</script>