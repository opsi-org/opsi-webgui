<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppFilterInput - Shared search/filter input with clear button and optional
  saveable search and optional match case / whole word / regular expression toggles (like the VS Code search box).
-->
<template>
  <UInput
    v-model="model"
    :placeholder="placeholder || $t('common.filter')"
    :aria-label="placeholder || $t('common.filter')"
    :icon="icons.filter"
    :size="effectiveSize"
    :class="inputClass"
    :aria-invalid="patternValid ? undefined : 'true'"
    :ui="{ trailing: 'pe-1' }"
  >
    <template v-if="model || showOptions" #trailing>
      <span class="flex items-center gap-0.5">
        <template v-if="showOptions">
          <CoreAppTooltip :text="String($t('filter.matchCase'))">
            <UButton
              size="xs"
              variant="solid"
              :color="options.matchCase ? 'primary' : 'neutral'"
              class="px-2 py-1 font-mono text-[0.6875rem] leading-none"
              :aria-label="String($t('filter.matchCase'))"
              :aria-pressed="options.matchCase"
              @click="toggleOption('matchCase')"
            >
              Aa
            </UButton>
          </CoreAppTooltip>
          <CoreAppTooltip :text="String($t('filter.wholeWord'))">
            <UButton
              size="xs"
              variant="solid"
              :color="options.wholeWord ? 'primary' : 'neutral'"
              class="px-2 py-1 font-mono text-[0.6875rem] leading-none underline"
              :aria-label="String($t('filter.wholeWord'))"
              :aria-pressed="options.wholeWord"
              @click="toggleOption('wholeWord')"
            >
              ab
            </UButton>
          </CoreAppTooltip>
          <CoreAppTooltip :text="regexTooltip">
            <UButton
              size="xs"
              variant="solid"
              :color="regexButtonColor"
              class="px-2 py-1 font-mono text-[0.6875rem] leading-none"
              :aria-label="regexTooltip"
              :aria-pressed="options.regex"
              @click="toggleOption('regex')"
            >
              .*
            </UButton>
          </CoreAppTooltip>
        </template>
        <CoreAppTooltip v-if="saveable && model" :text="String($t('savedSearches.saveCurrent'))">
          <UButton
            :icon="icons.bookmark"
            size="xs"
            variant="ghost"
            color="primary"
            :aria-label="String($t('savedSearches.saveCurrent'))"
            @click="emit('save')"
          />
        </CoreAppTooltip>
        <UButton
          v-if="model"
          :icon="icons.x"
          size="xs"
          variant="ghost"
          color="neutral"
          :aria-label="String($t('common.clear'))"
          @click="model = ''"
        />
      </span>
    </template>
  </UInput>
</template>

<script setup lang="ts">
  import { useUiStore } from '~/stores/uiStore'
  import { createTextFilterOptions, type TextFilterOptions } from '~/composables/useTextFilter'

  const props = withDefaults(
    defineProps<{
      placeholder?: string
      size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
      inputClass?: string
      showOptions?: boolean
      saveable?: boolean
      patternValid?: boolean
    }>(),
    {
      size: 'sm',
      inputClass: 'w-full sm:w-72 md:w-80 lg:w-96',
      showOptions: false,
      saveable: false,
      patternValid: true,
    },
  )

  const emit = defineEmits<{ (e: 'save'): void }>()

  const model = defineModel<string>({ default: '' })
  const options = defineModel<TextFilterOptions>('options', { default: () => createTextFilterOptions() })

  const icons = useIcons()
  const { t: $t } = useI18n()
  const uiStore = useUiStore()

  const effectiveSize = computed(() => (uiStore.isMobile ? 'xs' : props.size))

  // An invalid pattern is reported through the accessible name of the toggle, not by
  // colour alone.
  const regexTooltip = computed(() =>
    props.patternValid ? String($t('filter.regex')) : `${$t('filter.regex')} - ${$t('filter.regexInvalid')}`,
  )
  const regexButtonColor = computed(() => {
    if (!props.patternValid) return 'error' as const
    return options.value.regex ? ('primary' as const) : ('neutral' as const)
  })

  function toggleOption(key: keyof TextFilterOptions) {
    options.value = { ...options.value, [key]: !options.value[key] }
  }
</script>
