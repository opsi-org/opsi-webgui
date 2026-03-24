<template>
	<div class="flex flex-col h-full min-h-0">
		<div v-if="loading" class="flex items-center justify-center py-8">
			<UIcon :name="icons.loading" class="w-5 h-5 animate-spin text-(--color-text-muted)" />
		</div>

		<div v-else-if="error" class="text-xs text-red-500 py-2">{{ error }}</div>

		<template v-else>
			<div class="flex items-center gap-1 mb-2 shrink-0">
				<UInput v-model="searchQuery" :placeholder="t('typeToFilter')" size="xs" :icon="icons.filter"
					class="flex-1 min-w-0">
					<template v-if="searchQuery" #trailing>
						<UButton :icon="icons.close" size="xs" variant="link" color="neutral"
							@click="searchQuery = ''" />
					</template>
				</UInput>
				<UTooltip :text="`${t('clearAll')} (${selectionStore.selectedServers.length})`">
					<UButton :icon="icons.clear" size="xs" variant="ghost" color="error" @click="clearSelection" />
				</UTooltip>
			</div>

			<div class="flex-1 overflow-y-auto min-h-0 space-y-0.5">
				<div v-if="filteredServers.length === 0" class="text-xs text-(--color-text-muted) py-4 text-center">
					{{ t('noResults') }}
				</div>
				<div v-for="server in filteredServers" :key="server.serverId"
					class="flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-(--color-surface-hover) cursor-pointer"
					@click="toggleServer(server.serverId)">
					<UCheckbox :model-value="selectionStore.selectedServers.includes(server.serverId)" size="xs"
						@click.stop @update:model-value="toggleServer(server.serverId)" />
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-1.5">
							<UIcon :name="server.isConfigServer ? icons.serverStack : icons.server"
								class="w-3.5 h-3.5 shrink-0 text-(--color-text-muted)" />
							<span class="truncate" :class="server.isConfigServer ? 'font-medium' : ''">{{
								server.serverId
							}}</span>
						</div>
					</div>
					<UBadge v-if="server.isConfigServer" size="xs" variant="subtle" color="primary">{{ t('configServer')
					}}</UBadge>
				</div>
			</div>

		</template>
	</div>
</template>

<script setup lang="ts">
import { useSelectionStore } from '~/stores/selectionStore'

interface ServerItem {
	serverId: string
	description: string
	isConfigServer: boolean
}

const icons = useIcons()
const { t: i18nT } = useI18n()
const selectionStore = useSelectionStore()
const { getServers } = useApiHelpers()

const t = (key: string) => {
	const translated = i18nT(key)
	if (translated && translated !== key) return String(translated)
	return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

const loading = ref(false)
const error = ref<string | null>(null)
const servers = ref<ServerItem[]>([])
const searchQuery = ref('')

const filteredServers = computed(() => {
	if (!searchQuery.value) return servers.value
	const q = searchQuery.value.toLowerCase()
	return servers.value.filter(s =>
		s.serverId.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
	)
})

function toggleServer(serverId: string) {
	selectionStore.toggleServer(serverId, 'quickpanel')
}

function clearSelection() {
	if (selectionStore.configServer) {
		selectionStore.setServers([selectionStore.configServer], 'quickpanel')
	} else {
		selectionStore.clearServers()
	}
}

async function fetchServers() {
	loading.value = true
	error.value = null
	try {
		const result = await getServers({})
		if (result.error) {
			error.value = result.error.message
		} else if (result.data) {
			servers.value = result.data.map(d => ({
				serverId: d.depotId,
				description: d.description || '',
				isConfigServer: d.type === 'OpsiConfigserver',
			}))
		}
	} catch (e) {
		error.value = (e as Error).message
	} finally {
		loading.value = false
	}
}

const props = defineProps<{ active?: boolean }>()

onMounted(() => {
	// Data is fetched lazily when the component becomes visible
})

watch(() => props.active, (isActive) => {
	if (isActive && servers.value.length === 0 && !loading.value) {
		fetchServers()
	}
}, { immediate: true })
</script>
