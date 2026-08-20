<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  HostsCreateConfigModal - Shared modal for creating host/server configurations.
-->
<template>
  <CoreAppModal v-model:open="open" :dismissible="true">
    <template #content>
      <CoreAppCard class="min-w-96">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <CoreAppIcon :name="icons.add" class="w-5 h-5" />
              <h3 class="text-sm font-heading uppercase tracking-wide text-(--color-text) m-0">
                {{ $t('config.create') }}
              </h3>
            </div>
            <CoreAppButton
              variant="ghost"
              color="neutral"
              size="xs"
              :icon="icons.x"
              :aria-label="String($t('common.close'))"
              :title="String($t('common.close'))"
              @click="handleClose"
            />
          </div>
        </template>
        <div class="space-y-4">
          <div>
            <span class="block text-sm font-medium mb-1">{{ $t('config.id') }} *</span>
            <CoreAppInput v-model="newConfig.configId" :placeholder="String($t('config.idPlaceholder'))" size="sm" />
          </div>
          <div>
            <span class="block text-sm font-medium mb-1">{{ $t('common.description') }}</span>
            <CoreAppInput v-model="newConfig.description" size="sm" />
          </div>
          <div>
            <span class="block text-sm font-medium mb-1">{{ $t('common.type') }}</span>
            <CoreAppSelect v-model="newConfig.type" :items="configTypeOptions" size="sm" />
          </div>
          <div class="flex flex-wrap items-center gap-4">
            <span class="flex items-center gap-2 text-sm">
              <CoreAppCheckbox v-model="newConfig.multiValue" size="sm" />
              {{ $t('config.multiValue') }}
            </span>
            <span class="flex items-center gap-2 text-sm">
              <CoreAppCheckbox v-model="newConfig.editable" size="sm" />
              {{ $t('common.editable') }}
            </span>
          </div>
          <div v-if="newConfig.type === 'UnicodeConfig'">
            <span class="block text-sm font-medium mb-1">{{ $t('config.possibleValues') }}</span>
            <div v-if="newConfig.possibleValues.length > 0" class="flex flex-wrap gap-1 mb-1">
              <span
                v-for="(val, idx) in newConfig.possibleValues"
                :key="idx"
                class="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-(--color-primary-soft-bg) text-(--color-primary-soft-text) border border-(--color-primary)/20"
              >
                {{ val }}
                <CoreAppButton
                  type="button"
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  class="p-0! hover:text-(--color-error-soft-text) transition-colors"
                  @click="newConfig.possibleValues.splice(idx, 1)"
                >
                  <CoreAppIcon :name="icons.x" class="w-3 h-3" />
                </CoreAppButton>
              </span>
            </div>
            <div class="flex gap-1">
              <CoreAppInput
                v-model="newPossibleValue"
                :placeholder="$t('common.pressEnterToAdd')"
                size="sm"
                class="flex-1"
                @keydown.enter.prevent="addPossibleValue"
              />
              <CoreAppButton
                size="sm"
                variant="outline"
                color="primary"
                :icon="icons.add"
                :aria-label="String($t('common.add'))"
                @click="addPossibleValue"
              />
            </div>
          </div>
          <div v-if="newConfig.type === 'UnicodeConfig'">
            <span class="block text-sm font-medium mb-1">{{ $t('products.defaultValues') }}</span>
            <div v-if="newConfig.defaultValues.length > 0" class="flex flex-wrap gap-1 mb-1">
              <span
                v-for="(val, idx) in newConfig.defaultValues"
                :key="idx"
                class="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-(--color-primary-soft-bg) text-(--color-primary-soft-text) border border-(--color-primary)/20"
              >
                {{ val }}
                <CoreAppButton
                  type="button"
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  class="p-0! hover:text-(--color-error-soft-text) transition-colors"
                  @click="newConfig.defaultValues.splice(idx, 1)"
                >
                  <CoreAppIcon :name="icons.x" class="w-3 h-3" />
                </CoreAppButton>
              </span>
            </div>
            <div class="flex gap-1">
              <CoreAppInput
                v-model="newDefaultValue"
                :placeholder="$t('common.pressEnterToAdd')"
                size="sm"
                class="flex-1"
                @keydown.enter.prevent="addDefaultValue"
              />
              <CoreAppButton
                size="sm"
                variant="outline"
                color="primary"
                :icon="icons.add"
                :aria-label="String($t('common.add'))"
                @click="addDefaultValue"
              />
            </div>
          </div>
          <div v-if="newConfig.type === 'BoolConfig'">
            <span class="block text-sm font-medium mb-1">{{ $t('products.defaultValues') }}</span>
            <CoreAppSelect
              v-model="newConfig.boolDefault"
              :items="[
                { label: 'true', value: 'true' },
                { label: 'false', value: 'false' },
              ]"
              size="sm"
            />
          </div>
          <CoreAppAlertInline
            v-if="createConfigError"
            color="error"
            :title="$t('common.error')"
            :description="createConfigError"
            variant="subtle"
            closable
            @close="createConfigError = null"
          />
        </div>
        <template #footer>
          <div class="flex gap-2 justify-end">
            <CoreAppButton variant="ghost" color="neutral" @click="handleClose">{{ $t('common.cancel') }} </CoreAppButton>
            <CoreAppButton color="primary" :loading="creatingConfig" :disabled="!newConfig.configId.trim()" @click="handleCreateConfig">{{
              $t('common.create')
            }}</CoreAppButton>
          </div>
        </template>
      </CoreAppCard>
    </template>
  </CoreAppModal>
</template>

<script setup lang="ts">
  const open = defineModel<boolean>('open', { default: false })

  const emit = defineEmits<{
    created: []
  }>()

  const icons = useIcons()
  const { t: $t } = useI18n()
  const { createConfig } = useApiHelpers()

  const creatingConfig = ref(false)
  const createConfigError = ref<string | null>(null)
  const newPossibleValue = ref('')
  const newDefaultValue = ref('')
  const configTypeOptions = [
    { label: 'Unicode', value: 'UnicodeConfig' },
    { label: 'Bool', value: 'BoolConfig' },
  ]
  const newConfig = reactive({
    configId: '',
    description: '',
    type: 'UnicodeConfig' as 'UnicodeConfig' | 'BoolConfig',
    multiValue: false,
    editable: true,
    possibleValues: [] as string[],
    defaultValues: [] as string[],
    boolDefault: 'false',
  })

  function addPossibleValue() {
    const value = newPossibleValue.value.trim()
    if (value && !newConfig.possibleValues.includes(value)) {
      newConfig.possibleValues.push(value)
    }
    newPossibleValue.value = ''
  }

  function addDefaultValue() {
    const value = newDefaultValue.value.trim()
    if (value && !newConfig.defaultValues.includes(value)) {
      newConfig.defaultValues.push(value)
    }
    newDefaultValue.value = ''
  }

  function resetState() {
    creatingConfig.value = false
    createConfigError.value = null
    newConfig.configId = ''
    newConfig.description = ''
    newConfig.type = 'UnicodeConfig'
    newConfig.multiValue = false
    newConfig.editable = true
    newConfig.possibleValues = []
    newConfig.defaultValues = []
    newConfig.boolDefault = 'false'
    newPossibleValue.value = ''
    newDefaultValue.value = ''
  }

  function handleClose() {
    open.value = false
    resetState()
  }

  async function handleCreateConfig() {
    createConfigError.value = null
    if (!newConfig.configId.trim()) return
    creatingConfig.value = true
    try {
      const payload: Parameters<typeof createConfig>[0] = {
        configId: newConfig.configId.trim(),
        type: newConfig.type,
        editable: newConfig.editable,
        multiValue: newConfig.multiValue,
        description: newConfig.description,
      }
      if (newConfig.type === 'UnicodeConfig') {
        payload.possibleValues = newConfig.possibleValues
        payload.defaultValues = newConfig.defaultValues
      } else {
        payload.defaultValues = [newConfig.boolDefault]
      }
      await createConfig(payload)
      emit('created')
      handleClose()
    } catch (error: unknown) {
      createConfigError.value = error instanceof Error ? error.message : String(error)
    } finally {
      creatingConfig.value = false
    }
  }

  watch(open, (isOpen) => {
    if (!isOpen) {
      resetState()
    }
  })
</script>
