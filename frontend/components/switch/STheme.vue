<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <PFloatLabel variant="in">
    <PToggleSwitch
      v-model="isDarkMode"
      id="cbAutorefresh"
      name="autorefresh"
      :aria-label="
        'Switch dark mode. Currently is ' + (isDarkMode ? 'on' : 'off')
      "
      style="--p-toggleswitch-width: 5rem"
      v-bind="$props"
    />
    <label
      for="cbAutorefresh"
      class="text-xs text-white !pb-1"
      :class="isDarkMode ? '' : 'pl-4'"
      >{{
        isDarkMode ? $t('form.theme.cbvalue.on') : $t('form.theme.cbvalue.off')
      }}</label
    >
  </PFloatLabel>
</template>

<script setup lang="ts">
  const settings = storeSettings()

  const isDarkMode = computed({
    get: () => settings.colormode === 'dark',
    set: (value: boolean) => {
      settings.setColormode(value ? 'dark' : 'light')
    },
  })
</script>
