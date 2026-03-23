<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0
Authentication layout - provides a centered login form and a footer with theme/language options.
-->
<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <main class="flex-1 flex items-center justify-center">
      <slot />
    </main>
    <footer class="bg-opsi-blue text-white h-12 flex items-center justify-between px-6 text-sm">
      <a :href="uibLink" target="_blank" rel="noopener noreferrer">
        <img src="~/assets/images/uib_logo_wide_dark.svg" alt="uib GmbH Logo" class="h-7" />
      </a>
      <div class="flex items-center gap-2">
        <SettingsThemeToggle />
        <SettingsLanguageDropdown direction="up" />
      </div>
      <span class="opacity-80">v{{ $config.public.packageVersion || '1.0.0' }}</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const $config = useRuntimeConfig()

const { locale } = useI18n()
const uibLink = computed(() => {
  return locale.value === 'de' ? 'https://uib.de/de/' : 'https://uib.de/en/'
})
</script>