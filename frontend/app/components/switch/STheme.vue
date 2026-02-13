<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <p-float-label variant="in">
    <p-toggle-switch
      v-model="isDarkMode"
      id="cbAutorefresh"
      name="autorefresh"
      :aria-label="'Switch dark mode. Currently is ' + (isDarkMode ? 'on' : 'off')"
      style="--p-toggleswitch-width: 5rem"
      v-bind="$props"
      data-testid="theme-toggle"
    />
    <label for="cbAutorefresh" class="text-xs !pb-2" :class="isDarkMode ? 'text-white' : 'pl-4 '">{{
      isDarkMode ? $t('dark') : $t('light')
    }}</label>
  </p-float-label>
</template>

<script setup lang="ts">
  const settings = storeSettings()

  const { isLight } = storeToRefs(storeSettings())
  const isDarkMode = computed({
    get: () => !isLight.value,
    set: (value: boolean) => {
      settings.setDark(value)
    },
  })
</script>
