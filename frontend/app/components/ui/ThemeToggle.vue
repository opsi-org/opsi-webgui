<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <button @click="toggleTheme" class="p-2 rounded hover:bg-white/20 transition-colors"
    :title="isDarkMode ? 'Light mode' : 'Dark mode'">
    <UIcon :name="isDarkMode ? icons.themeDark : icons.themeLight" class="w-5 h-5" />
  </button>
</template>

<script setup lang="ts">
const icons = useIcons()
const colorMode = useColorMode()
const isDarkMode = computed(() => colorMode.value === 'dark')
const toggleTheme = () => colorMode.preference = isDarkMode.value ? 'light' : 'dark'
</script>