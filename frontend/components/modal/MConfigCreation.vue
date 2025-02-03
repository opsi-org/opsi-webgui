<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div>
    <PDialog
      v-model:visible="visible"
      modal
      :header="$t('title.creation.config')"
      :style="{ width: '25rem' }"
    >
      <!-- Name -->
      <div class="flex flex-col gap-1 pb-2">
        <!-- <div v-for="(v, k) in data" :key="k" class="flex flex-col gap-1 pb-2"> -->
        <div class=".k-name">
          <label for="name">{{ data.name.label }}</label>
          <PInputText
            v-if="data.name.type === 'text'"
            id="name"
            type="text"
            v-model="data.name.value"
            fluid
            class="border-[1px]"
          />
        </div>
        <div class=".k-desc">
          <label :for="'description'">{{ data.description.label }}</label>
          <PInputText
            v-if="data.description.type === 'text'"
            id="description"
            type="text"
            v-model="data.description.value"
            fluid
            class="border-[1px]"
          />
        </div>
        <div class=".k-boolValue flex justify-between">
          <label for="boolValue">{{ data.boolValue.label }}</label>
          <PCheckbox
            id="boolValue"
            binary
            v-model="data.boolValue.value"
            class="border-[1px]"
          />
        </div>
        <div
          class=".k-editable flex justify-between"
          v-if="data.boolValue.value == false"
        >
          <label for="editable">{{ data.editable.label }}</label>
          <PCheckbox
            id="editable"
            binary
            v-model="data.editable.value"
            class="border-[1px]"
          />
        </div>
        <div
          class=".k-multiValue flex justify-between"
          v-if="data.boolValue.value == false"
        >
          <label for="multiValue">{{ data.multiValue.label }}</label>
          <PCheckbox
            id="multiValue"
            binary
            v-model="data.multiValue.value"
            class="border-[1px]"
          />
        </div>
        <div class=".k-standardValues" v-if="data.boolValue.value == false">
          <label for="standardValues">{{ data.standardValues.label }}</label>
          <SelectSSelect
            :allow-empty="true"
            info-id="standardValues"
            :editable="true"
            v-model:selection="standardValueSWrapper"
            :multi-selection="data.multiValue.value"
          />
        </div>
        <div class=".k-possibleValues" v-if="data.boolValue.value == false">
          <label for="possibleValues">{{ data.possibleValues.label }}</label>
          <SelectSSelect
            :allow-empty="true"
            info-id="possibleValues"
            :editable="true"
            v-model:selection="data.possibleValues.values"
            :multi-selection="true"
          />
        </div>
      </div>
      <!-- <pre>{{ data }} </pre> -->

      <div class="flex justify-end gap-2">
        <el-button @click="cancel">{{ $t('label.cancel') }}</el-button>
        <el-button type="primary" @click="save" :disabled="dataValid">
          {{ $t('label.select') }}
        </el-button>
      </div>
    </PDialog>
  </div>
</template>

<script setup lang="ts">
  const $t = useI18n().t

  const visible = ref(true)
  const $emit = defineEmits(['refetch'])
  const props = defineProps({
    refetchOnCancel: { type: Boolean, default: false },
  })

  const data = ref({
    name: {
      label: $t('form.config.name'),
      value: '',
      type: 'text',
    },
    description: {
      label: $t('form.config.description'),
      value: '',
      type: 'text',
    },
    boolValue: {
      label: $t('form.config.boolValue'),
      value: true,
      type: 'boolean',
    },
    editable: {
      label: $t('form.config.editable'),
      value: true,
      type: 'boolean',
    },
    multiValue: {
      label: $t('form.config.multiValue'),
      value: false,
      type: 'boolean',
    },
    possibleValues: {
      label: $t('form.config.possibleValues'),
      values: [] as string[],
      type: 'string[]',
    },
    standardValues: {
      label: $t('form.config.standardValue'),
      value: '' as string,
      values: [] as string[],
      type: 'stringOrString[]',
    },
  })

  const dataValid = computed(() => {
    if (data.value.name.value === '') {
      return false
    }
    return true
  })
  const standardValueSWrapper = computed({
    get: () =>
      data.value.multiValue.value
        ? data.value.standardValues.values
        : data.value.standardValues.value,
    set: (value: string | string[]) => {
      if (data.value.multiValue.value) {
        data.value.standardValues.values = value as string[]
      } else {
        data.value.standardValues.value = value as string
      }
    },
  })

  function save() {
    // TODO: save if method is implemented (#763)
    $emit('refetch')
    visible.value = false
  }
  function cancel() {
    if (props.refetchOnCancel) {
      $emit('refetch')
    }
    visible.value = false
  }
</script>
