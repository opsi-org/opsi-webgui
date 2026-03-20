<template>
	<div class="flex flex-col h-full min-h-0">
		<div v-if="loading" class="flex items-center justify-center py-8">
			<UIcon :name="icons.loading" class="w-5 h-5 animate-spin text-(--color-text-muted)" />
		</div>

		<div v-else-if="error" class="text-xs text-red-500 py-2">{{ error }}</div>

		<template v-else>
			<div class="mb-2 shrink-0">
				<UInput v-model="searchQuery" :placeholder="t('filter')" size="xs" :icon="icons.search">
					<template v-if="searchQuery" #trailing>
						<UButton :icon="icons.close" size="xs" variant="link" color="neutral"
							@click="searchQuery = ''" />
					</template>
				</UInput>
			</div>

			<div class="flex-1 overflow-y-auto min-h-0 space-y-0.5">
				<div v-if="filteredServers.length === 0" class="text-xs text-(--color-text-muted) py-4 text-center">
					{{ t('noResults') }}
				</div>
				<div v-for="server in filteredServers" :key="server.depotId"
					class="flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-(--color-surface-hover) cursor-pointer"
					@click="toggleServer(server.depotId)">
					<UCheckbox :model-value="selectionStore.selectedDepots.includes(server.depotId)" size="xs"
						@click.stop @update:model-value="toggleServer(server.depotId)" />
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-1.5">
							<UIcon :name="server.isConfigServer ? icons.serverStack : icons.server"
								class="w-3.5 h-3.5 shrink-0 text-(--color-text-muted)" />
							<span class="truncate" :class="server.isConfigServer ? 'font-medium' : ''">{{ server.depotId
								}}</span>
						</div>
						<span v-if="server.description"
							class="text-[10px] text-(--color-text-muted) truncate block pl-5">{{
								server.description }}</span>
					</div>
					<UBadge v-if="server.isConfigServer" size="xs" variant="subtle" color="primary">config</UBadge>
				</div>
			</div>

			<div v-if="selectionStore.selectedDepots.length > 0"
				class="shrink-0 pt-2 mt-2 border-t border-(--color-border)">
				<div class="flex items-center justify-between text-xs">
					<span class="text-(--color-text-muted)">{{ selectionStore.selectedDepots.length }}
						{{ t('selected') }}</span>
					<div class="flex gap-2">
						<UButton size="xs" variant="link" color="primary" @click="selectAll">{{ t('selectAll') }}
						</UButton>
						<UButton size="xs" variant="link" color="error" @click="clearSelection">{{ t('clearAll') }}
						</UButton>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { useSelectionStore } from '~/stores/selectionStore'

interface ServerItem {
	depotId: string
	description: string
	isConfigServer: boolean
}

const icons = useIcons()
const { t: i18nT } = useI18n()
const selectionStore = useSelectionStore()
const { getDepots } = useApiHelpers()

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
		s.depotId.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
	)
})

function toggleServer(depotId: string) {
	selectionStore.toggleDepot(depotId, 'quickpanel')
}

function selectAll() {
	selectionStore.setDepots(servers.value.map(s => s.depotId), 'quickpanel')
}

function clearSelection() {
	if (selectionStore.configServer) {
		selectionStore.setDepots([selectionStore.configServer], 'quickpanel')
	} else {
		selectionStore.clearDepots()
	}
}

async function fetchServers() {
	loading.value = true
	error.value = null
	try {
		const result = await getDepots({})
		if (result.error) {
			error.value = result.error.message
		} else if (result.data) {
			servers.value = result.data.map(d => ({
				depotId: d.depotId,
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

onMounted(fetchServers)
</script>
