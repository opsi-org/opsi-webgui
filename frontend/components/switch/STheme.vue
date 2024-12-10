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
