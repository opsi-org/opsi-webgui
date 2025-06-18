<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div>
    <p-dialog
      v-model:visible="visible"
      modal
      :header="$t('createConfig')"
      :style="{ width: '25rem' }"
    >
      <!-- Name -->
      <div class="flex flex-col gap-1 pb-2">
        <div class=".k-name">
          <label for="name">{{ configdata.name.label }}</label>
          <p-input-text
            v-if="configdata.name.type === 'text'"
            id="name"
            type="text"
            v-model="configdata.name.value"
            fluid
            class="border-[1px]"
          />
          <p-message v-if="nameExists" severity="error" size="small" variant="simple">
            {{ $t('message.alreadyExists', { item: configdata.name.value }) }}
          </p-message>
        </div>
        <div class=".k-desc">
          <label :for="'description'">{{ configdata.description.label }}</label>
          <p-input-text
            v-if="configdata.description.type === 'text'"
            id="description"
            type="text"
            v-model="configdata.description.value"
            fluid
            class="border-[1px]"
          />
        </div>
        <div class=".k-boolValue flex justify-between">
          <label for="boolValue">{{ configdata.boolValue.label }}</label>
          <p-checkbox
            id="boolValue"
            binary
            v-model="configdata.boolValue.value"
            class="border-[1px]"
          />
        </div>
        <div class=".k-editable flex justify-between" v-if="!configdata.boolValue.value">
          <label for="editable">{{ configdata.editable.label }}</label>
          <p-checkbox
            id="editable"
            binary
            v-model="configdata.editable.value"
            class="border-[1px]"
          />
        </div>
        <div class=".k-multiValue flex justify-between" v-if="!configdata.boolValue.value">
          <label for="multiValue">{{ configdata.multiValue.label }}</label>
          <p-checkbox
            id="multiValue"
            binary
            v-model="configdata.multiValue.value"
            class="border-[1px]"
          />
        </div>

        <div class=".k-possibleValues" v-if="!configdata.boolValue.value">
          <label for="possibleValues">{{ configdata.possibleValues.label }}</label>
          <SelectSSelect
            :allow-empty="true"
            info-id="possibleValues"
            :editable="true"
            :multi-selection="true"
            v-model:data="possibleValuesWrapper"
            v-model:selection="configdata.possibleValues.values"
          />
        </div>
        <div class=".k-defaultValues" v-if="!configdata.boolValue.value">
          <label for="defaultValues">{{ configdata.defaultValues.label }}</label>
          <SelectSSelect
            :allow-empty="true"
            info-id="defaultValues"
            :multi-selection="configdata.multiValue.value"
            v-model:data="possibleValuesWrapper"
            :selected-options="
              configdata.multiValue.value
                ? configdata.defaultValues.values
                : configdata.defaultValues.value
            "
            @change="
              (selection) => {
                if (!configdata.multiValue.value) {
                  configdata.defaultValues.value = selection
                } else {
                  configdata.defaultValues.values = selection
                }
              }
            "
          />
        </div>
      </div>
      <IconILoading
        v-if="isLoading || isLoadingNameExists"
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
      <div v-else class="flex justify-end gap-2">
        <el-button @click="cancel">{{ $t('cancel') }}</el-button>
        <el-button
          type="primary"
          @click="save"
          :disabled="!dataValid || nameExists || isLoading || isLoadingNameExists"
        >
          {{ $t('create') }}
        </el-button>
      </div>
    </p-dialog>
  </div>
</template>

<script setup lang="ts">
  import { useNotification } from '~/composables/mixins/useComponent'
  const { notifyError, notifyInfo } = useNotification()
  const $t = useI18n().t

  const isLoading = ref(false)
  //const visible = ref(true)
  const visible = defineModel('visible', {
    type: Boolean,
    default: true,
  })
  const $emit = defineEmits(['refetch'])
  const nameExists = ref(true)
  const isLoadingNameExists = ref(false)
  const props = defineProps({
    refetchOnCancel: { type: Boolean, default: false },
    defaultItem: {
      type: Object,
      required: false,
    },
  })

  const configdata = ref({
    name: {
      label: $t('name'),
      value: props.defaultItem?.configId || '',
      type: 'text',
    },
    description: {
      label: $t('description'),
      value: props.defaultItem?.description || '',
      type: 'text',
    },
    boolValue: {
      label: $t('boolValue'),
      value: props.defaultItem ? props.defaultItem?.type === 'BoolConfig' : true,
      type: 'boolean',
    },
    editable: {
      label: $t('editable'),
      value: props.defaultItem?.editable || true,
      type: 'boolean',
    },
    multiValue: {
      label: $t('multiValue'),
      value: props.defaultItem?.multiValue || false,
      type: 'boolean',
    },
    possibleValues: {
      label: $t('possibleValues'),
      values: props.defaultItem?.possibleValues || [],
      type: 'string[]',
    },
    defaultValues: {
      label: $t('standardValues'),
      value: props.defaultItem?.value == undefined ? '' : props.defaultItem?.value,
      values: props.defaultItem?.values == undefined ? [] : props.defaultItem?.values || [],
      type: 'stringOrString[]',
    },
  })

  const dataValid = computed(async () => {
    if (configdata.value.name.value === '') {
      return false
    }
    return nameExists
  })

  const defaultValuesWrapper4PossValue = computed({
    get: () =>
      //configdata.value.multiValue.value ? configdata.value.defaultValues.values : [configdata.value.defaultValues.value],
      configdata.value.multiValue.value
        ? configdata.value.defaultValues.values.filter((n: string) => n)
        : [configdata.value.defaultValues.value || ''],
    set: (value: string | string[]) => {},
  })

  const possibleValuesWrapper = computed({
    get: () => [
      ...new Set([
        ...configdata.value.possibleValues.values,
        ...configdata.value.defaultValues.values,
        configdata.value.defaultValues.value,
      ]),
    ],
    set: (value: string[]) => {
      configdata.value.possibleValues.values = value
      if (configdata.value.multiValue.value) {
        configdata.value.defaultValues.values = value
      } else {
        configdata.value.defaultValues.value = value[0] || ''
      }
    },
  })

  watch(
    () => configdata.value.name.value,
    async (newName) => {
      if (newName === '') {
        nameExists.value = false
        return
      }
      nameExists.value = await checkValid()
    }
  )
  watch(
    () => configdata.value.multiValue.value,
    (newMultiValue) => {
      if (newMultiValue) {
        configdata.value.defaultValues.values = [configdata.value.defaultValues.value]
        configdata.value.defaultValues.value = ''
      } else {
        configdata.value.defaultValues.value = configdata.value.defaultValues.values?.[0] || ''
        configdata.value.defaultValues.values = []
      }
    }
  )
  async function checkValid() {
    isLoadingNameExists.value = true
    if (configdata.value.name.value === '') {
      notifyInfo({ message: $t('message.form.invalid') })
      isLoadingNameExists.value = false
      return false
    }
    // /api/opsidata/config/exists/{configid}
    const url = `/opsidata/config/exists/${configdata.value.name.value}`
    const { data, error } = await useApiGET(url)
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      isLoadingNameExists.value = false
      return false
    }
    if (data?.value !== undefined) {
      isLoadingNameExists.value = false
      return data.value === true
    }
    isLoadingNameExists.value = false
    return false
  }
  async function save() {
    // TODO: save if method is implemented (#763)
    isLoading.value = true
    if (!dataValid.value) {
      notifyError({ message: $t('message.form.invalid') })
      isLoading.value = false
      return
    }

    const url = '/opsidata/config'
    const defValue = [
      ...configdata.value.possibleValues.values,
      ...configdata.value.defaultValues.values,
      configdata.value.defaultValues.value,
    ]
    const request = {
      configId: configdata.value.name.value,
      description: configdata.value.description.value,
      type: configdata.value.boolValue.value ? 'BoolConfig' : 'UnicodeConfig',
      editable: configdata.value.editable.value,
      multiValue: configdata.value.multiValue.value,
      possibleValues: [...new Set(defValue)].filter((n) => n),
      defaultValues: defaultValuesWrapper4PossValue.value,
    }
    const { error } = await useApiPOST(url, request)
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      isLoading.value = false
      return
    }

    isLoading.value = false
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
