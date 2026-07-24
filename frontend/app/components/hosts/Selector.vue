<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  HostsSelector - Host (servers or clients) selection dropdown with filter.
-->
<template>
  <CoreAppSelectMenu
    :model-value="modelValue || ''"
    :items="dropdownOptions"
    :loading="loading"
    :filter-fields="['label']"
    :placeholder="
      placeholder ||
      (type === 'server' ? String($t('servers.select')) : String($t('clients.select')))
    "
    value-key="value"
    class="min-w-56"
    :ui="{ content: 'max-h-60 overflow-y-auto' }"
    :size="size"
    @update:model-value="onSelect"
    @open="onOpen"
  >
    <template #leading>
      <CoreAppIcon
        :name="type === 'server' ? icons.server : icons.client"
        class="w-4 h-4 text-muted"
      />
    </template>
    <template #item="{ item }">
      <template v-if="item.value === '__clear__'">
        <div class="flex items-center gap-1.5 text-muted italic py-0.5 text-xs">
          <CoreAppIcon :name="icons.xCircle" class="w-3.5 h-3.5 shrink-0" />
          <span class="text-xs">{{ $t('common.clearSelection') }}</span>
        </div>
      </template>
      <template v-else>
        <div class="min-w-0 py-0.5 leading-tight">
          <span class="truncate font-medium text-xs">{{ item.label }}</span>
        </div>
      </template>
    </template>
  </CoreAppSelectMenu>
</template>

<script setup lang="ts">
  import { useSelectionStore } from '~/stores/selectionStore'

  interface DropdownItem {
    label: string
    value: string
  }

  const selectorItemsCache = new Map<string, string[]>()

  interface Props {
    modelValue?: string
    placeholder?: string
    allowAll?: boolean
    allowClear?: boolean
    type?: 'client' | 'server'
    size?: 'xs' | 'sm'
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: undefined,
    placeholder: undefined,
    allowAll: false,
    allowClear: true,
    type: 'client',
    size: 'xs',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
    change: [value: string]
  }>()

  const icons = useIcons()
  const { t: $t } = useI18n()
  const { getClientIds, getServers, getServerIds } = useApiHelpers()
  const selectionStore = useSelectionStore()

  const loading = ref(false)
  const items = ref<string[]>([])
  const fetched = ref(false)

  const cacheKey = computed(() => {
    if (props.type === 'server') return 'server::all'
    const selected = [...selectionStore.selectedServers].sort().join(',')
    return `client::${selected || 'all'}`
  })

  const normalizedSelectedServers = computed(() =>
    selectionStore.selectedServers
      .map((server) => String(server || '').trim())
      .filter((server) => server.length > 0)
  )

  const filteredOptions = computed<DropdownItem[]>(() => {
    const result: DropdownItem[] = items.value.map((item) => ({ label: item, value: item }))
    if (props.allowClear && props.modelValue) {
      result.unshift({ label: String($t('common.clearSelection')), value: '__clear__' })
    }
    if (props.allowAll && result.length > 0) {
      const allLabel =
        props.type === 'server' ? String($t('servers.all')) : String($t('clients.all'))
      return [{ label: allLabel, value: '' }, ...result.filter((o) => o.value !== '__clear__')]
    }
    return result
  })

  const dropdownOptions = computed<DropdownItem[]>(() => filteredOptions.value)

  async function fetchItems(force = false) {
    const key = cacheKey.value
    if (!force) {
      const cached = selectorItemsCache.get(key)
      if (cached) {
        items.value = cached
        fetched.value = true
        return
      }
    }

    if (fetched.value && !force) return
    loading.value = true
    try {
      if (props.type === 'server') {
        const { data, error } = await getServers()
        items.value = !error && Array.isArray(data)
          ? [...new Set(data.map((server) => server.depotId).filter(Boolean))].sort()
          : []
      } else {
        let scopedServers =
          normalizedSelectedServers.value.length > 0
            ? normalizedSelectedServers.value
            : selectionStore.configServer
              ? [selectionStore.configServer]
              : []

        if (scopedServers.length === 0) {
          const allServers = await getServerIds()
          scopedServers = !allServers.error && Array.isArray(allServers.data) ? allServers.data : []
        }

        let clientIds: string[] = []
        if (scopedServers.length > 0) {
          const result = await getClientIds(scopedServers)
          clientIds = !result.error && Array.isArray(result.data) ? result.data : []
        }

        items.value = [...new Set(clientIds.filter(Boolean))].sort()
      }
      if (items.value.length > 0) {
        selectorItemsCache.set(key, [...items.value])
        fetched.value = true
      } else {
        fetched.value = false
      }
    } finally {
      loading.value = false
    }
  }

  function onOpen() {
    if (!fetched.value) {
      fetchItems()
    }
  }

  function onSelect(value: string) {
    if (value === '__clear__') {
      emit('update:modelValue', '')
      emit('change', '')
    } else {
      emit('update:modelValue', value)
      emit('change', value)
    }
  }

  onMounted(() => {
    fetchItems(true)
  })

  watch(
    normalizedSelectedServers,
    () => {
      if (props.type === 'client') {
        selectorItemsCache.clear()
        fetched.value = false
        items.value = []
        fetchItems(true)
      }
    },
    { deep: true, immediate: true }
  )

  defineExpose({ refresh: () => fetchItems(true) })
</script>
