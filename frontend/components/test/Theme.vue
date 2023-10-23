<template>
  <div ref="target">
    <form>
      <label for="locale-select">{{ $t('theme') }} ({{ color }}): </label>
      <select id="locale-select" v-model="color">
        <option value="light">light</option>
        <option value="dark">dark</option>
      </select>
      <el-switch v-model="colorMode" inline-prompt active-text="dark" inactive-text="light" size="large"></el-switch>
      <!-- <b-icon :icon="icon.loading" /> -->
    </form>
  </div>
</template>

<script setup>
import { useIcons } from '~/composables/mixins/useIcons';

// import {useColorMode} from 'bootstrap-vue-next'
const icon = useIcons()
const settings = useSettingsStore()
const theme = ref(settings.theme)

const color = useColorMode();
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
});

// watch(theme, (newTheme, oldTheme) => {
//   console.log('themes', oldTheme, newTheme)
//   settings.changeTheme(newTheme)
//   color.preference = newTheme
// });
</script>
