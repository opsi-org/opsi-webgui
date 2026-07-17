<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  SettingsLanguageDropdown - Language selection dropdown.
-->
<template>
  <div class="relative" ref="containerRef">
    <CoreAppButton @click="open = !open" color="primary" size="xs" data-testid="language-dropdown"
      :title="String($t('common.settings'))">
      <CoreAppIcon :name="icons.language" class="w-3.5 h-3.5" />
      <span class="text-xs font-medium">{{ currentLocale.toUpperCase() }}</span>
      <CoreAppIcon :name="icons.chevronDown" class="w-3 h-3 transition-transform" :class="{ 'rotate-180': open }" />
    </CoreAppButton>
    <Transition :name="direction === 'up' ? 'dropdown-up' : 'dropdown'">
      <div v-if="open" data-testid="language-dropdown-menu" :class="[
        'absolute right-0 min-w-50 bg-(--color-surface-elevated) border border-(--color-border) rounded-lg shadow-lg z-50 py-1',
        direction === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
      ]">
        <div v-if="priorityLocales.length > 0" class="px-2 pb-1">
          <CoreAppButton v-for="locale in priorityLocales" :key="locale.code" @click="switchTo(locale.code)"
            variant="ghost" color="neutral" size="xs" block class="justify-start"
            :data-testid="`language-dropdown-item-${locale.code}`">
            <span>{{ locale.name || locale.code.toUpperCase() }}</span>
          </CoreAppButton>
        </div>

        <div v-if="communityLocales.length > 0" class="mt-1 border-t border-(--color-border) px-2 pt-1">
          <div class="px-2 py-1 text-[10px] uppercase tracking-wide text-(--color-text-muted)">
            {{ $t('settings.communityLanguages') }}
          </div>
          <CoreAppButton v-for="locale in communityLocales" :key="locale.code" @click="switchTo(locale.code)"
            variant="ghost" color="neutral" size="xs" block class="justify-start"
            :data-testid="`language-dropdown-item-${locale.code}`">
            <span>{{ locale.name || locale.code.toUpperCase() }}</span>
          </CoreAppButton>
        </div>

        <div class="mt-1 border-t border-(--color-border) px-1 pt-1">
          <a :href="transifexUrl" target="_blank" rel="noopener noreferrer"
            class="flex min-h-8 items-center rounded-md px-2 py-1 text-xs text-(--color-primary-soft-text) hover:bg-(--color-surface-hover)"
            data-testid="language-dropdown-item-contribute" :title="String($t('message.contributeTranslations'))"
            @click="open = false">
            {{ $t('message.translationMissing') }}
          </a>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  direction?: 'up' | 'down'
}>()

const icons = useIcons()
const { locale, locales, setLocale } = useI18n()
const currentLocale = computed(() => locale.value || 'en')
const supportedLocales = ['en', 'de', 'fr']
const transifexUrl = 'https://app.transifex.com/opsi-org/opsiorg/opsi-webguijson/'

const open = ref(false)
const containerRef = ref<HTMLElement | null>(null)

interface LocaleInfo { code: string; name?: string }

const availableLocales = computed<LocaleInfo[]>(() => {
  const allLocales = locales.value as LocaleInfo[]
  return allLocales.filter(l => l.code !== currentLocale.value)
})

const priorityOrder = ['en', 'de', 'fr']

const priorityLocales = computed(() =>
  priorityOrder
    .map(code => availableLocales.value.find(locale => locale.code === code))
    .filter((locale): locale is LocaleInfo => !!locale)
)

const communityLocales = computed(() =>
  availableLocales.value.filter(locale => !priorityOrder.includes(locale.code))
)

function switchTo(code: string) {
  setLocale(code as Parameters<typeof setLocale>[0])
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