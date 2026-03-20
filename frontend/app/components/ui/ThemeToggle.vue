<template>
  <button @click="toggleTheme" class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors border" :class="isDarkMode
    ? 'bg-(--color-surface) hover:bg-(--color-surface-hover) border-(--color-border) text-white'
    : 'bg-white hover:bg-gray-100 border-gray-300 text-gray-700'"
    :aria-label="isDarkMode ? t('switchToLight') : t('switchToDark')" data-testid="theme-toggle">
    <UIcon :name="isDarkMode ? icons.themeDark : icons.themeLight" class="w-4 h-4" />
    <span class="hidden sm:inline text-xs font-medium">
      {{ isDarkMode ? t('dark') : t('light') }}
    </span>
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