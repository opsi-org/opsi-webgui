<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppPasswordInput - Password input with visibility toggle.
-->
<template>
  <UInput
    v-bind="$attrs"
    :model-value="modelValue"
    :type="show ? 'text' : 'password'"
    :placeholder="placeholder"
    :aria-label="ariaLabel"
    :disabled="disabled"
    :size="effectiveSize"
    :icon="icon"
    :ui="{ trailing: 'pe-1' }"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #trailing>
      <UButton
        color="neutral"
        variant="link"
        :size="effectiveSize"
        :icon="show ? icons.eyeOff : icons.eye"
        :aria-label="show ? String($t('auth.hidePassword')) : String($t('auth.showPassword'))"
        :aria-pressed="show"
        :disabled="disabled"
        @click="show = !show"
      />
    </template>
  </UInput>
</template>

<script setup lang="ts">
  import { useUiStore } from '~/stores/uiStore'

  defineOptions({
    inheritAttrs: false,
  })

  interface Props {
    modelValue?: string
    placeholder?: string
    disabled?: boolean
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    icon?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    placeholder: '',
    disabled: false,
    size: 'md',
    icon: undefined,
  })

  defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const icons = useIcons()
  const { t: $t } = useI18n()
  const uiStore = useUiStore()

  const attrs = useAttrs()
  const ariaLabel = computed(() => {
    const existing = attrs['aria-label']
    if (typeof existing === 'string' && existing.trim()) return existing
    return props.placeholder || undefined
  })

  const effectiveSize = computed(() => (uiStore.isMobile ? 'xs' : props.size))

  const show = ref(false)
</script>
