<template>
  <el-switch v-model="colorModeIsDark" inline-prompt active-text="dark" inactive-text="light" size="large" v-bind="$props"/>
</template>

<script setup lang="ts">
const settings = storeSettings()
const colorModeIsDark = computed({
  get: () => settings.colormode === 'dark',
  set: ()=> settings.toggleTheme()
})

</script>
