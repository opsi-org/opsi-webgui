<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  QuickpanelServerSelectionList - List for selecting servers.
-->
<template>
	<div class="flex flex-col h-full min-h-0">
		<div v-if="loading" class="flex items-center justify-center py-8">
			<CoreAppLoadingSpinner size="sm" />
		</div>

		<div v-else-if="error" class="text-xs text-(--color-error-soft-text) py-2">{{ error }}</div>

		<template v-else>
			<div class="flex items-center gap-1 mb-2 shrink-0">
				<CoreAppFilterInput v-model="searchQuery" size="xs" input-class="flex-1 min-w-0" />
				<CoreAppTooltip v-if="isDepotAccessRestricted"
					:text="$t('opsiConfig.serverFeatures.depotAccess.disabled')">
					<CoreAppBadge color="warning" variant="subtle" size="xs" class="cursor-help shrink-0">
						{{ $t('auth.restricted') }}
					</CoreAppBadge>
				</CoreAppTooltip>
				<CoreAppTooltip :text="`${$t('common.clearAll')} (${selectionStore.selectedServers.length})`">
					<CoreAppButton :icon="icons.xCircle" size="xs" variant="outline" color="primary"
						:aria-label="$t('common.clearAll')" @click="clearSelection" />
				</CoreAppTooltip>
			</div>

			<div class="flex-1 overflow-y-auto min-h-0 space-y-0.5">
				<div v-if="filteredServers.length === 0" class="text-xs text-(--color-text-muted) py-4 text-center">
					{{ $t('common.noResults') }}
				</div>
				<div v-for="server in filteredServers" :key="server.serverId"
					class="flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-(--color-surface-hover)">
					<CoreAppCheckbox :model-value="selectionStore.selectedServers.includes(server.serverId)" size="xs"
						:aria-label="server.serverId" @update:model-value="toggleServer(server.serverId)" />
					<button type="button"
						class="flex-1 min-w-0 flex items-center gap-1.5 text-left cursor-pointer bg-transparent"
						@click="toggleServer(server.serverId)">
						<CoreAppIcon :name="server.isConfigServer ? icons.serverStack : icons.server"
							class="w-3.5 h-3.5 shrink-0 text-(--color-text-muted)" />
						<span class="truncate" :class="server.isConfigServer ? 'font-medium' : ''">{{
							server.serverId
						}}</span>
					</button>
					<CoreAppBadge v-if="server.isConfigServer" size="xs" variant="subtle" color="primary">{{
						$t('servers.config')
					}}</CoreAppBadge>
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
const { isDepotAccessRestricted } = useUserPermissions()
const { getServers } = useApiHelpers()

const $t = (key: string) => {
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
