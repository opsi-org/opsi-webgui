<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppRadio - UI library wrapper for radio button rendering.
-->
<template>
  <label
    class="flex items-center gap-2 cursor-pointer"
    :for="inputId"
    :class="disabled ? 'opacity-50 cursor-not-allowed' : ''"
  >
    <input
      :id="inputId"
      type="radio"
      :checked="modelValue === value"
      :name="name"
      :disabled="disabled"
      class="border-(--color-border) text-opsi-blue focus:ring-opsi-blue"
      :class="sizeClass"
      @change="$emit('update:modelValue', value)"
    />
    <span v-if="label" class="text-sm">{{ label }}</span>
    <slot v-else />
  </label>
</template>

<script setup lang="ts">
  import { useUiStore } from '~/stores/uiStore'

  interface Props {
    modelValue?: unknown
    value?: unknown
    name?: string
    label?: string
    disabled?: boolean
    size?: 'xs' | 'sm' | 'md' | 'lg'
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'sm',
  })

  const uiStore = useUiStore()

  defineEmits<{ 'update:modelValue': [value: unknown] }>()

  const inputId = useId()

  const sizeClass = computed(() => {
    const effectiveSize = uiStore.isMobile ? 'xs' : props.size
    switch (effectiveSize) {
      case 'xs':
        return 'w-3 h-3'
      case 'sm':
        return ''
      case 'md':
        return 'w-4 h-4'
      case 'lg':
        return 'w-5 h-5'
      default:
        return ''
    }
  })
</script>
