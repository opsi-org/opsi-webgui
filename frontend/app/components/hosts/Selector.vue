<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  HostsSelector - Host (servers or clients) selection dropdown with filter.
-->
<template>
  <CoreAppSelectMenu :model-value="modelValue || ''" :items="dropdownOptions" :loading="loading"
    :filter-fields="['label', 'description']"
    :placeholder="placeholder || (type === 'server' ? String($t('servers.select')) : String($t('clients.select')))"
    value-key="value" class="min-w-48" size="sm" @update:model-value="onSelect" @open="onOpen">
    <template #leading>
      <CoreAppIcon :name="type === 'server' ? icons.server : icons.client" class="w-4 h-4 text-muted" />
    </template>
    <template #item="{ item }">
      <template v-if="item.value === '__clear__'">
        <div class="flex items-center gap-2 text-muted italic py-0.5">
          <CoreAppIcon :name="icons.xCircle" class="w-4 h-4 shrink-0" />
          <span class="text-sm">{{ $t('common.clearSelection') }}</span>
        </div>
      </template>
      <template v-else>
        <div class="flex flex-col min-w-0 py-0.5">
          <span class="truncate text-sm font-medium">{{ item.label }}</span>
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
  description?: string
}

interface Props {
  modelValue?: string
  placeholder?: string
  allowAll?: boolean
  allowClear?: boolean
  type?: 'client' | 'server'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  placeholder: undefined,
  allowAll: false,
  allowClear: true,
  type: 'client',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const { getClients, getServers, getClientIds, getServerIds } = useApiHelpers()
const selectionStore = useSelectionStore()

const loading = ref(false)
const items = ref<Array<{ id: string; description: string }>>([])
const fetched = ref(false)

const filteredOptions = computed<DropdownItem[]>(() => {
  const result: DropdownItem[] = items.value.map((item) => ({
    label: item.id,
    value: item.id,
    description: item.description || '',
  }))
  if (props.allowClear && props.modelValue) {
    result.unshift({ label: String($t('common.clearSelection')), value: '__clear__' })
  }
  if (props.allowAll && result.length > 0) {
    const allLabel = props.type === 'server' ? String($t('servers.all')) : String($t('clients.all'))
    return [{ label: allLabel, value: '' }, ...result.filter(o => o.value !== '__clear__')]
  }
  return result
})

const dropdownOptions = computed<DropdownItem[]>(() => filteredOptions.value)

async function fetchItems(force = false) {
  if (fetched.value && !force) return
  loading.value = true
  try {
    if (props.type === 'server') {
      const { data, error } = await getServers()
      if (!error) items.value = (data || []).map((d) => ({ id: d.depotId, description: d.description || '' }))
    } else {
      const selectedServers = selectionStore.selectedServers
      if (selectedServers.length > 0) {
        const { data, error } = await getClientIds(selectedServers)
        if (!error && data) {
          items.value = (data as string[]).map((id) => ({ id, description: '' }))
        }
      } else {
        const { data: serverData } = await getServerIds()
        if (serverData && serverData.length > 0) {
          const { data, error } = await getClientIds(serverData)
          if (!error && data) {
            items.value = (data as string[]).map((id) => ({ id, description: '' }))
          }
        } else {
          const { data, error } = await getClients()
          if (!error) items.value = (data || []).map((c) => ({ id: c.clientId, description: c.description || '' }))
        }
      }
    }
    fetched.value = true
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
  fetchItems()
})

watch(() => selectionStore.selectedServers, () => {
  if (props.type === 'client') {
    fetched.value = false
    fetchItems(true)
  }
}, { deep: true })

defineExpose({ refresh: () => fetchItems(true) })
</script>
