<template>
  <el-switch
    v-model="isDarkMode"
    inline-prompt
    active-text="dark"
    inactive-text="light"
    v-bind="$props"
  />
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
