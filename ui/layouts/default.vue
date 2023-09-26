
<template>
  <div :class="'theme-'+settings.theme">
    Some default structure shared across all pages. Current theme: {{ settings.theme }}
    <slot />
  </div>
</template>

<script setup>
const settings = useSettingsStore()
</script>