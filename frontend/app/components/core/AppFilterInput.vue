<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppFilterInput - Search/filter input with clear button.
-->
<template>
  <UInput
    v-model="model"
    :placeholder="placeholder || $t('common.filter')"
    :aria-label="placeholder || $t('common.filter')"
    :icon="icons.filter"
    :size="effectiveSize"
    :class="inputClass"
  >
    <template v-if="model" #trailing>
      <UButton
        :icon="icons.x"
        :size="effectiveSize"
        variant="link"
        color="neutral"
        :aria-label="String($t('common.clear'))"
        :title="String($t('common.clear'))"
        @click="model = ''"
      />
    </template>
  </UInput>
</template>

<script setup lang="ts">
  import { useUiStore } from '~/stores/uiStore'

  const props = withDefaults(
    defineProps<{
      placeholder?: string
      size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
      inputClass?: string
    }>(),
    {
      size: 'sm',
      inputClass: 'w-full sm:w-72 md:w-80 lg:w-96',
    }
  )

  const model = defineModel<string>({ default: '' })

  const icons = useIcons()
  const { t: $t } = useI18n()
  const uiStore = useUiStore()

  const effectiveSize = computed(() => (uiStore.isMobile ? 'xs' : props.size))
</script>
