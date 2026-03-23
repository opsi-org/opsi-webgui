<template>
  <button @click="toggleTheme"
    class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors bg-opsi-blue text-white hover:bg-opsi-blue/90"
    :aria-label="isDarkMode ? t('light') : t('dark')">
    <UIcon :name="isDarkMode ? icons.themeDark : icons.themeLight" class="w-3.5 h-3.5" />
    <span class="text-xs font-medium">{{ isDarkMode ? t('dark') : t('light') }}</span>
  </button>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/uiStore'

const icons = useIcons()
const colorMode = useColorMode()
const uiStore = useUiStore()
const { t } = useI18n()

const isDarkMode = computed(() => colorMode.preference === 'dark')

function toggleTheme() {
  const newMode = isDarkMode.value ? 'light' : 'dark'
  colorMode.preference = newMode
  uiStore.setTheme(newMode)
  document.cookie = `nuxt-color-mode=${newMode}; path=/; max-age=31536000; SameSite=Lax`
}
</script>