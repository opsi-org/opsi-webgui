HostSelector - Unified searchable dropdown for selecting a client or a server with lazy loading.
<template>
  <USelectMenu :model-value="modelValue || ''" :items="dropdownOptions" :loading="loading"
    :filter-fields="['label', 'description']"
    :placeholder="placeholder || (type === 'server' ? String($t('selectServer')) : String($t('selectClient')))"
    value-key="value" class="min-w-48" size="sm" @update:model-value="onSelect" @open="onOpen">
    <template #leading>
      <UIcon :name="type === 'server' ? icons.server : icons.client" class="w-4 h-4 text-muted" />
    </template>
    <template #item="{ item }">
      <template v-if="item.value === '__clear__'">
        <div class="flex items-center gap-2 text-muted italic py-0.5">
          <UIcon :name="icons.xCircle" class="w-4 h-4 shrink-0" />
          <span class="text-sm">{{ $t('clearSelection') }}</span>
        </div>
      </template>
      <template v-else>
        <div class="flex flex-col min-w-0 py-0.5">
          <span class="truncate text-sm font-medium">{{ item.label }}</span>
        </div>
      </template>
    </template>
  </USelectMenu>
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
    result.unshift({ label: String($t('clearSelection')), value: '__clear__' })
  }
  if (props.allowAll && result.length > 0) {
    const allLabel = props.type === 'server' ? String($t('allServers')) : String($t('allClients'))
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
      // Use lightweight client IDs endpoint for fast lazy loading
      const selectedServers = selectionStore.selectedServers
      if (selectedServers.length > 0) {
        const { data, error } = await getClientIds(selectedServers)
        if (!error && data) {
          items.value = (data as string[]).map((id) => ({ id, description: '' }))
        }
      } else {
        // Fall back to server IDs endpoint first, then get all client IDs
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
  // Lazy load: fetch items when dropdown is first opened
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
  // Fetch items eagerly for both types
  // Server items are always small, client items may be large but needed for standalone pages
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
