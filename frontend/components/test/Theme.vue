<template>
  <el-switch v-model="colorMode" inline-prompt active-text="dark" inactive-text="light" size="large" />
</template>

<script setup>
import { useIcons } from '~/composables/mixins/useIcons';

const color = useColorMode();
const icon = useIcons()
const settings = storeSettings()
const theme = ref(settings.theme)
color.preference = settings.theme
color.value = settings.theme

const colorMode = computed({
  get: () => color.value === 'dark',
  set: () => {
    if (color.value === 'dark'){
      color.preference ='light'
     } else {
      color.preference = 'dark'
    }
    color.value = color.preference
    theme.value = color.preference
    settings.changeTheme(color.preference)
  },
})
</script>
