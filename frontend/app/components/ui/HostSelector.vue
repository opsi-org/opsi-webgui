<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0

HostSelector - Searchable dropdown for selecting a client/host.
Used on subpages like /clients/config, /clients/logs where you can view
data for a specific client.
-->
<template>
  <div class="relative" ref="containerRef">
    <!-- Trigger button -->
    <button
      @click="open = !open"
      type="button"
      class="flex items-center gap-2 px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-opsi-blue transition-colors text-sm min-w-48"
    >
      <UIcon :name="icons.client" class="w-4 h-4 text-gray-400" />
      <span class="flex-1 text-left truncate" :class="modelValue ? 'text-gray-900 dark:text-white' : 'text-gray-400'">
        {{ modelValue || placeholder }}
      </span>
      <UIcon :name="icons.arrowDown" class="w-4 h-4 text-gray-400 transition-transform" :class="{ 'rotate-180': open }" />
    </button>

    <!-- Dropdown -->
    <Transition name="dropdown">
      <div
        v-if="open"
        class="absolute top-full left-0 mt-1 min-w-56 max-h-64 overflow-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
      >
        <!-- Search input -->
        <div class="p-2 border-b border-gray-200 dark:border-gray-700">
          <UInput
            v-model="search"
            :placeholder="String($t('filter'))"
            :icon="icons.search"
            size="xs"
          />
        </div>
        <!-- All clients option -->
        <button
          v-if="allowAll"
          type="button"
          @click="selectHost(null)"
          class="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-left"
        >
          <UIcon :name="icons.list" class="w-4 h-4" />
          {{ $t('allClients') || 'All Clients' }}
        </button>
        <div v-if="allowAll" class="border-b border-gray-200 dark:border-gray-700" />
        <!-- Host list -->
        <template v-if="filteredHosts.length">
          <button
            v-for="host in filteredHosts"
            :key="host.id"
            type="button"
            @click="selectHost(host.id)"
            class="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-left"
            :class="{ 'bg-opsi-blue/10': host.id === modelValue }"
          >
            <span :class="['w-2 h-2 rounded-full shrink-0', host.online ? 'bg-green-500' : 'bg-gray-400']" />
            <span class="truncate flex-1">{{ host.id }}</span>
            <span v-if="host.description" class="text-xs text-gray-400 truncate max-w-24">{{ host.description }}</span>
          </button>
        </template>
        <div v-else class="px-3 py-4 text-center text-sm text-gray-500">
          {{ $t('message.noItemsSelected') || 'No hosts found' }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: string | null
  placeholder?: string
  allowAll?: boolean
}>(), {
  modelValue: null,
  placeholder: 'Select host...',
  allowAll: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'change': [value: string | null]
}>()

const icons = useIcons()
const { $t } = useNuxtApp()

const open = ref(false)
const search = ref('')
const containerRef = ref<HTMLElement | null>(null)

// Close on click outside
onMounted(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
      open.value = false
    }
  }
  document.addEventListener('click', handleClickOutside)
  onUnmounted(() => document.removeEventListener('click', handleClickOutside))
})

// Mock host data - in real app, this would come from a composable/store
const hosts = ref([
  { id: 'client1.domain.local', description: 'Workstation 1', online: true },
  { id: 'client2.domain.local', description: 'Workstation 2', online: false },
  { id: 'laptop1.domain.local', description: 'Marketing Laptop', online: true },
  { id: 'server-test.domain.local', description: 'Test Server', online: false },
])

const filteredHosts = computed(() => {
  if (!search.value) return hosts.value
  const q = search.value.toLowerCase()
  return hosts.value.filter(h => 
    h.id.toLowerCase().includes(q) || h.description?.toLowerCase().includes(q)
  )
})

function selectHost(id: string | null) {
  emit('update:modelValue', id)
  emit('change', id)
  search.value = ''
  open.value = false
}
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
