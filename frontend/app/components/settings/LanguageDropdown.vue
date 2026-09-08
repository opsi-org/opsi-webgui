<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  SettingsLanguageDropdown - Language selection dropdown.
-->
<template>
  <CoreAppPopover open-on-hover :content="{ side: direction === 'up' ? 'top' : 'bottom', align: 'end' }">
    <CoreAppButton color="primary" size="xs" data-testid="language-dropdown" :title="String(t('common.settings'))">
      <CoreAppIcon :name="icons.language" class="w-3.5 h-3.5" />
      <span class="text-xs font-medium">{{ currentLocale.toUpperCase() }}</span>
      <CoreAppIcon :name="icons.chevronDown" class="w-3 h-3" />
    </CoreAppButton>
    <template #content>
      <div data-testid="language-dropdown-menu" class="min-w-50 max-h-[min(24rem,70vh)] overflow-y-auto py-1">
        <div v-if="priorityLocales.length > 0" class="px-2 pb-1">
          <CoreAppButton
            v-for="locale in priorityLocales"
            :key="locale.code"
            @click="switchTo(locale.code)"
            variant="ghost"
            color="neutral"
            size="xs"
            block
            class="justify-start"
            :data-testid="`language-dropdown-item-${locale.code}`"
          >
            <span>{{ locale.name || locale.code.toUpperCase() }}</span>
          </CoreAppButton>
        </div>

        <div class="mt-1 border-t border-(--color-border) px-1 pt-1">
          <a
            :href="transifexUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex min-h-8 items-center rounded-md px-2 py-1 text-xs text-(--color-primary-soft-text) hover:bg-(--color-surface-hover)"
            data-testid="language-dropdown-item-contribute"
            :title="String(t('message.contributeTranslations'))"
          >
            {{ t('message.translationMissing') }}
          </a>
        </div>
      </div>
    </template>
  </CoreAppPopover>
</template>

<script setup lang="ts">
  const props = defineProps<{
    direction?: 'up' | 'down'
  }>()

  const icons = useIcons()
  const { locale, locales, setLocale, t } = useI18n()
  const currentLocale = computed(() => locale.value || 'en')
  const transifexUrl = 'https://app.transifex.com/opsi-org/opsiorg/opsi-webguijson/'

  interface LocaleInfo {
    code: string
    name?: string
  }

  const visibleLocaleCodes = ['en', 'de', 'fr']

  const supportedLocales = computed(() =>
    (locales.value as LocaleInfo[]).map((locale) => String(locale.code)).filter((code) => visibleLocaleCodes.includes(code)),
  )

  const availableLocales = computed<LocaleInfo[]>(() => {
    const allLocales = locales.value as LocaleInfo[]
    return allLocales.filter((l) => visibleLocaleCodes.includes(l.code) && l.code !== currentLocale.value)
  })

  const priorityOrder = ['en', 'de', 'fr']

  const priorityLocales = computed(() =>
    priorityOrder
      .map((code) => availableLocales.value.find((locale) => locale.code === code))
      .filter((locale): locale is LocaleInfo => !!locale),
  )

  async function switchTo(code: string) {
    if (!supportedLocales.value.includes(code)) return
    try {
      await setLocale(code as Parameters<typeof setLocale>[0])
    } catch (error) {
      console.error('Failed to switch locale', { code, error })
    }
  }
</script>
