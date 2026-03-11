<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0
-->
<template>
  <button @click="toggleTheme"
    class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors bg-card hover:bg-(--color-surface-hover) border border-(--color-border)"
    :aria-label="isDarkMode ? t('switchToLight') : t('switchToDark')" data-testid="theme-toggle">
    <UIcon :name="isDarkMode ? icons.themeDark : icons.themeLight" class="w-4 h-4" />
    <span class="hidden sm:inline text-xs font-medium">
      {{ isDarkMode ? t('dark') : t('light') }}
    </span>
  </button>
</template>

<script setup lang="ts">
const icons = useIcons()
const colorMode = useColorMode()
const { t } = useI18n()

const isDarkMode = computed(() => colorMode.preference === 'dark')

function toggleTheme() {
  const newMode = isDarkMode.value ? 'light' : 'dark'
  colorMode.preference = newMode
  // Ensure cookie is set for persistence
  document.cookie = `nuxt-color-mode=${newMode}; path=/; max-age=31536000; SameSite=Lax`
}
</script>