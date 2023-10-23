
<template>
  <div :class="'theme-'+settings.theme">
    Some default structure shared across all pages. Current theme: {{ settings.theme }}
    <slot />
    after slot
  </div>
</template>

<script setup>
// const color = useColorMode();
const settings = useSettingsStore()
</script>