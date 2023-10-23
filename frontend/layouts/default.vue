
<template>
  <div :class="'theme-'+color">
    Some default structure shared across all pages. Current theme: {{ settings.theme }}, {{  color }}
    <slot />
    after slot
  </div>
</template>

<script setup>
const color = useColorMode();
const settings = useSettingsStore()
</script>