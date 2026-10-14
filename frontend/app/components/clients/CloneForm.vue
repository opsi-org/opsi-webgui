<!--
  This file is part of the OPSI-WebGUI application.
  OPSI-WebGUI is the web-based management interface for OPSI.
  https://opsi.org/en/

  Copyright (c) UIB GmbH info@uib.de 2026
  All rights reserved.
  License: AGPL-3.0

  ClientsCloneForm - Form for cloning an existing client to a new client.
-->
<template>
  <div v-if="!canCreateClients || isReadOnly" class="flex items-center justify-center h-full p-8">
    <CoreAppAlertInline color="warning" :title="$t('auth.permissionDenied')">
      <template #description>{{
        isReadOnly ? $t('opsiConfig.serverFeatures.readOnly.disabled') : $t('opsiConfig.serverFeatures.clientCreation.disabled')
      }}</template>
    </CoreAppAlertInline>
  </div>
  <template v-else>
    <div class="shrink-0 pb-2 sticky top-0 z-10 bg-(--color-surface) mb-2 flex flex-wrap items-center justify-end gap-1.5">
      <CoreAppButton
        v-if="sourceId"
        color="success"
        :loading="loading"
        :title="String($t('clients.clone.title'))"
        size="sm"
        @click="cloneClient"
      >
        <CoreAppIcon :name="icons.clone" /> {{ $t('clients.clone.title') }}
      </CoreAppButton>
      <CoreAppButton
        :icon="icons.refresh"
        color="primary"
        variant="outline"
        size="sm"
        :title="String($t('common.refresh'))"
        @click="refresh"
      />
    </div>

    <CoreAppEmptyState v-if="!sourceId && !loading" :icon="icons.client" :message="String($t('clients.selectClone'))" class="flex-1" />

    <div v-else class="flex-1 overflow-y-auto space-y-3 opsi-dense-form opsi-compact-page">
      <CoreAppAlertInline v-if="success" color="success" :title="String($t('common.success'))" closable @close="success = false">
        <template #description>{{ $t('clients.clone.ok') }}</template>
      </CoreAppAlertInline>
      <CoreAppAlertInline
        v-if="error"
        color="error"
        :title="String($t('common.error'))"
        :description="error"
        closable
        @close="error = null"
      />

      <div class="opsi-card">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-xs font-heading uppercase tracking-wide m-0">
            {{ $t('clients.create.title') }}
          </h2>
        </div>
        <div>
          <div
            class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors"
          >
            <span class="text-sm min-w-0 md:w-1/3 break-all"> {{ $t('clients.id') }} <span class="text-error">*</span> </span>
            <div class="flex-1 flex flex-col items-start gap-1 min-w-0">
              <div class="flex items-center gap-2 w-full">
                <CoreAppInput
                  v-model="clientName"
                  :disabled="loading"
                  size="sm"
                  :placeholder="String($t('fields.hostname.enter'))"
                  class="flex-1"
                />
                <CoreAppInput
                  v-model="domain"
                  :disabled="loading"
                  size="sm"
                  :placeholder="String($t('fields.domainExample'))"
                  class="flex-1"
                />
              </div>
              <div v-if="formErrors.newId" class="text-xs text-error">
                {{ formErrors.newId }}
              </div>
            </div>
          </div>
          <div
            class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors"
          >
            <span class="text-sm min-w-0 md:w-1/3 break-all">
              {{ $t('fields.ip') }}
            </span>
            <div class="flex-1">
              <CoreAppInput
                v-model="cloneclient.target.ipAddress"
                :disabled="loading"
                size="sm"
                :placeholder="String($t('fields.ipExample'))"
                class="w-full"
              />
            </div>
          </div>
          <div
            class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors"
          >
            <span class="text-sm min-w-0 md:w-1/3 break-all">
              {{ $t('fields.mac') }}
            </span>
            <div class="flex-1">
              <CoreAppInput
                v-model="cloneclient.target.hardwareAddress"
                :disabled="loading"
                size="sm"
                :placeholder="String($t('fields.macExample'))"
                class="w-full"
              />
            </div>
          </div>
          <div
            class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors"
          >
            <span class="text-sm min-w-0 md:w-1/3 break-all">
              {{ $t('fields.uuid') }}
            </span>
            <div class="flex-1">
              <CoreAppInput
                v-model="cloneclient.target.systemUUID"
                :disabled="loading"
                size="sm"
                :placeholder="String($t('fields.uuidExample'))"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="opsi-card h-full">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-xs font-heading uppercase tracking-wide m-0">
            {{ $t('clients.clone.options') }}
          </h2>
        </div>
        <div>
          <div
            class="form-row w-full flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors"
          >
            <CoreAppButton
              type="button"
              variant="ghost"
              color="neutral"
              class="text-sm! min-w-0! md:w-1/3! break-all! text-left! justify-start!"
              :aria-pressed="cloneclient.options.configs"
              @click="cloneclient.options.configs = !cloneclient.options.configs"
            >
              {{ $t('config.items') }}
            </CoreAppButton>
            <div class="flex-1 flex items-center gap-2 min-w-0">
              <CoreAppCheckbox v-model="cloneclient.options.configs" :aria-label="String($t('config.items'))" :disabled="loading" />
            </div>
          </div>
          <div
            class="form-row w-full flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors"
          >
            <CoreAppButton
              type="button"
              variant="ghost"
              color="neutral"
              class="text-sm! min-w-0! md:w-1/3! break-all! text-left! justify-start!"
              :aria-pressed="cloneclient.options.products"
              @click="cloneclient.options.products = !cloneclient.options.products"
            >
              {{ $t('products.title') }}
            </CoreAppButton>
            <div class="flex-1 flex items-center gap-2 min-w-0">
              <CoreAppCheckbox v-model="cloneclient.options.products" :aria-label="String($t('products.title'))" :disabled="loading" />
            </div>
          </div>
          <div
            class="form-row w-full flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors"
          >
            <CoreAppButton
              type="button"
              variant="ghost"
              color="neutral"
              class="text-sm! min-w-0! md:w-1/3! break-all! text-left! justify-start!"
              :aria-pressed="cloneclient.options.productProperties"
              @click="cloneclient.options.productProperties = !cloneclient.options.productProperties"
            >
              {{ $t('products.properties') }}
            </CoreAppButton>
            <div class="flex-1 flex items-center gap-2 min-w-0">
              <CoreAppCheckbox
                v-model="cloneclient.options.productProperties"
                :aria-label="String($t('products.properties'))"
                :disabled="loading"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
  const { canCreateClients, isReadOnly } = useUserPermissions()
  const icons = useIcons()
  const { t: $t } = useI18n()
  const { getClientIds, cloneClient: cloneClientApi } = useApiHelpers()
  const props = defineProps<{
    sourceId?: string | null
  }>()

  const emit = defineEmits(['saved'])

  const loading = ref(false)
  const error = ref<string | null>(null)
  const success = ref(false)

  const clientName = ref('')
  const domain = ref('')
  const clientIds = ref<string[]>([])

  const cloneclient = reactive({
    target: {
      hostId: '',
      ipAddress: '',
      hardwareAddress: '',
      systemUUID: '',
    },
    options: {
      configs: true,
      products: true,
      productProperties: false,
    },
  })

  function getDefaultDomain(id: string) {
    const idx = id.indexOf('.')
    return idx > 0 ? id.substring(idx) : ''
  }

  const hasChanges = computed(
    () =>
      clientName.value.length > 0 ||
      domain.value !== (props.sourceId ? getDefaultDomain(props.sourceId) : '') ||
      !!cloneclient.target.ipAddress ||
      !!cloneclient.target.hardwareAddress ||
      !!cloneclient.target.systemUUID ||
      !cloneclient.options.configs ||
      !cloneclient.options.products ||
      cloneclient.options.productProperties,
  )

  onMounted(() => {
    if (props.sourceId) domain.value = getDefaultDomain(props.sourceId)
    fetchClientIds()
  })

  async function fetchClientIds() {
    const result = await getClientIds([])
    clientIds.value = result.data || []
  }

  const formErrors = reactive({ newId: '' })
  watch([clientName, domain], () => {
    formErrors.newId = ''
    if (!clientName.value) return
    const fqdn = clientName.value + domain.value
    if (clientIds.value.includes(fqdn)) {
      formErrors.newId = $t('clients.validation.exists')
    }
  })

  function checkValid() {
    return (
      clientName.value.length > 0 &&
      !Number.isInteger(parseInt(clientName.value.charAt(0))) &&
      !clientIds.value.includes(clientName.value + domain.value)
    )
  }

  async function cloneClient() {
    if (!props.sourceId || !checkValid()) {
      error.value = $t('clients.validation.exists')
      return
    }
    loading.value = true
    error.value = null
    success.value = false
    cloneclient.target.hostId = clientName.value + domain.value
    try {
      const res = await cloneClientApi(props.sourceId, cloneclient.target, cloneclient.options)
      if (res.error) throw res.error
      refresh()
      success.value = true
      emit('saved')
    } catch (e: unknown) {
      error.value = (e instanceof Error ? e.message : '') || $t('clients.clone.err')
    } finally {
      loading.value = false
    }
  }

  function refresh() {
    clientName.value = ''
    domain.value = props.sourceId ? getDefaultDomain(props.sourceId) : ''
    cloneclient.target = {
      hostId: '',
      ipAddress: '',
      hardwareAddress: '',
      systemUUID: '',
    }
    cloneclient.options = {
      configs: true,
      products: true,
      productProperties: false,
    }
    formErrors.newId = ''
    error.value = null
    success.value = false
  }

  defineExpose({
    refresh,
    hasChanges,
  })

  defineShortcuts({
    ctrl_enter: {
      usingInput: true,
      handler: (e) => {
        e.preventDefault()
        if (!canCreateClients.value || isReadOnly.value) return
        cloneClient()
      },
    },
  })
</script>
