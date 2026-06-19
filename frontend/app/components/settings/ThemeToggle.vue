<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  SettingsThemeToggle - Dark/light theme toggle switch.
-->
<template>
  <CoreAppButton @click="toggleTheme" color="primary" size="xs" :aria-label="isDarkMode ? t('light') : t('dark')">
    <CoreAppIcon :name="isDarkMode ? icons.themeDark : icons.themeLight" class="w-3.5 h-3.5" />
    <span class="text-xs font-medium">{{ isDarkMode ? t('dark') : t('light') }}</span>
  </CoreAppButton>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/uiStore'

const icons = useIcons()
const colorMode = useColorMode()
const uiStore = useUiStore()
const { t } = useI18n()

const isDarkMode = computed(() => colorMode.preference === 'dark')

function toggleTheme() {
  const newMode = isDarkMode.value ? 'light' : 'dark'
  colorMode.preference = newMode
  uiStore.setTheme(newMode)
  document.cookie = `opsi-webgui-color-mode=${newMode}; path=/; max-age=31536000; SameSite=Lax`
}
</script>