<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div class="relative" ref="containerRef">
    <button @click="open = !open" type="button"
      class="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/20 transition-colors text-sm">
      <UIcon :name="icons.language" class="w-4 h-4" />
      <span>{{ currentLocale.toUpperCase() }}</span>
      <UIcon :name="icons.arrowDown" class="w-3 h-3 transition-transform" :class="{ 'rotate-180': open }" />
    </button>
    <Transition :name="direction === 'up' ? 'dropdown-up' : 'dropdown'">
      <div v-if="open" :class="[
        'absolute right-0 min-w-32 bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] dark:border-[var(--color-border)] rounded-lg shadow-lg z-50 py-1',
        direction === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
      ]">
        <button v-for="locale in availableLocales" :key="locale.code" @click="switchTo(locale.code)" type="button"
          class="w-full px-3 py-2 text-left text-sm text-[var(--color-text)] dark:text-[var(--color-text)] hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)] transition-colors">
          {{ locale.name || locale.code.toUpperCase() }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  direction?: 'up' | 'down'
}>()

const icons = useIcons()
const { $getLocale, $switchLocale, $getLocales } = useNuxtApp()
const currentLocale = computed(() => $getLocale() || 'en')

const open = ref(false)
const containerRef = ref<HTMLElement | null>(null)

interface LocaleInfo { code: string; name?: string }

const availableLocales = computed(() => {
  const locales = $getLocales() as LocaleInfo[]
  return locales.filter(l => l.code !== currentLocale.value)
})

function switchTo(code: string) {
  $switchLocale(code)
  open.value = false
}

onMounted(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
      open.value = false
    }
  }
  document.addEventListener('click', handleClickOutside)
  onUnmounted(() => document.removeEventListener('click', handleClickOutside))
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active,
.dropdown-up-enter-active,
.dropdown-up-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.dropdown-up-enter-from,
.dropdown-up-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>