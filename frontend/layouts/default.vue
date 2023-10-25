
<template>
  <div :class="'webgui-theme-'+color">
    Some default structure shared across all pages. Current theme: {{ settings.theme }}
    <slot />
    after slot
  </div>
</template>

<script setup>
const settings = useSettingsStore()
</script>