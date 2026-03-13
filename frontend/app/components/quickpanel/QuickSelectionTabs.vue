<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0
-->
<template>
	<div class="quick-selection-tabs">
		<!-- Tab Navigation -->
		<div class="flex border-b border-[--color-border] mb-3">
			<button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value" :class="[
				'flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all border-b-2 -mb-px relative',
				activeTab === tab.value
					? 'border-opsi-blue text-opsi-blue'
					: 'border-transparent text-[--color-text-muted] hover:text-[--color-text] hover:border-[--color-border]'
			]" :title="tab.label">
				<UIcon :name="tab.icon" class="w-4 h-4" />
				<span class="hidden sm:inline">{{ tab.label }}</span>
				<span v-if="tab.count > 0"
					class="min-w-[18px] h-[18px] flex items-center justify-center text-[10px] rounded-full font-semibold"
					:class="activeTab === tab.value ? 'bg-opsi-blue text-white' : 'bg-[--color-surface-hover] text-[--color-text-muted]'">
					{{ tab.count }}
				</span>
			</button>
		</div>

		<!-- Tab Content -->
		<div class="tab-content overflow-hidden rounded-lg border border-[--color-border] bg-[--color-surface]">
			<!-- All Selections Tab -->
			<div v-if="activeTab === 'all'" class="p-3">
				<div v-if="!hasAnySelections" class="text-center py-8">
					<UIcon name="i-heroicons-cursor-arrow-ripple"
						class="w-10 h-10 mx-auto mb-2 text-[--color-text-muted] opacity-30" />
					<p class="text-sm text-[--color-text-muted]">{{ t('noSelectionsYet') }}
					</p>
					<p class="text-xs text-[--color-text-muted] mt-1 opacity-70">
						{{ t('selectFromOtherTabs') }}
					</p>
				</div>
				<div v-else class="space-y-3 max-h-[35vh] overflow-y-auto pr-1">
					<!-- Servers Section -->
					<div v-if="stateStore.selectedServers.length > 0">
						<div class="flex items-center justify-between mb-1.5">
							<span
								class="text-xs font-medium text-[--color-text-muted] uppercase flex items-center gap-1.5">
								<UIcon :name="icons.server" class="w-3.5 h-3.5" />
								{{ t('servers') }}
							</span>
							<button @click="stateStore.clearServers()" class="text-xs text-red-500 hover:text-red-600">
								{{ t('clear') }}
							</button>
						</div>
						<div class="space-y-1">
							<div v-for="item in stateStore.selectedServers" :key="item"
								class="flex items-center justify-between px-2 py-1.5 rounded bg-white dark:bg-[--color-background] text-xs group hover:bg-[--color-surface-hover]">
								<span class="font-mono truncate">{{ item }}</span>
								<button @click="stateStore.toggleServer(item)"
									class="opacity-0 group-hover:opacity-100 transition-opacity">
									<UIcon name="i-heroicons-x-mark"
										class="w-3.5 h-3.5 text-[--color-text-muted] hover:text-red-500" />
								</button>
							</div>
						</div>
					</div>

					<!-- Client Groups Section -->
					<div v-if="stateStore.selectedClientGroups.length > 0">
						<div class="flex items-center justify-between mb-1.5">
							<span
								class="text-xs font-medium text-[--color-text-muted] uppercase flex items-center gap-1.5">
								<UIcon name="i-heroicons-user-group" class="w-3.5 h-3.5" />
								{{ t('clientGroups') }}
							</span>
							<button @click="stateStore.clearClientGroups()"
								class="text-xs text-red-500 hover:text-red-600">
								{{ t('clear') }}
							</button>
						</div>
						<div class="space-y-1">
							<div v-for="item in stateStore.selectedClientGroups" :key="item"
								class="flex items-center justify-between px-2 py-1.5 rounded bg-white dark:bg-[--color-background] text-xs group hover:bg-[--color-surface-hover]">
								<span class="truncate">{{ item }}</span>
								<button @click="removeClientGroup(item)"
									class="opacity-0 group-hover:opacity-100 transition-opacity">
									<UIcon name="i-heroicons-x-mark"
										class="w-3.5 h-3.5 text-[--color-text-muted] hover:text-red-500" />
								</button>
							</div>
						</div>
					</div>

					<!-- Product Groups Section -->
					<div v-if="stateStore.selectedProductGroups.length > 0">
						<div class="flex items-center justify-between mb-1.5">
							<span
								class="text-xs font-medium text-[--color-text-muted] uppercase flex items-center gap-1.5">
								<UIcon :name="icons.product" class="w-3.5 h-3.5" />
								{{ t('productGroups') }}
							</span>
							<button @click="stateStore.clearProductGroups()"
								class="text-xs text-red-500 hover:text-red-600">
								{{ t('clear') }}
							</button>
						</div>
						<div class="space-y-1">
							<div v-for="item in stateStore.selectedProductGroups" :key="item"
								class="flex items-center justify-between px-2 py-1.5 rounded bg-white dark:bg-[--color-background] text-xs group hover:bg-[--color-surface-hover]">
								<span class="truncate">{{ item }}</span>
								<button @click="removeProductGroup(item)"
									class="opacity-0 group-hover:opacity-100 transition-opacity">
									<UIcon name="i-heroicons-x-mark"
										class="w-3.5 h-3.5 text-[--color-text-muted] hover:text-red-500" />
								</button>
							</div>
						</div>
					</div>

					<!-- Individual Clients Section -->
					<div v-if="stateStore.selectedClients.length > 0">
						<div class="flex items-center justify-between mb-1.5">
							<span
								class="text-xs font-medium text-[--color-text-muted] uppercase flex items-center gap-1.5">
								<UIcon :name="icons.client" class="w-3.5 h-3.5" />
								{{ t('clients') }}
							</span>
							<button @click="stateStore.clearClients()" class="text-xs text-red-500 hover:text-red-600">
								{{ t('clear') }}
							</button>
						</div>
						<div class="space-y-1">
							<div v-for="item in stateStore.selectedClients.slice(0, 10)" :key="item"
								class="flex items-center justify-between px-2 py-1.5 rounded bg-white dark:bg-[--color-background] text-xs group hover:bg-[--color-surface-hover]">
								<span class="font-mono truncate">{{ item }}</span>
								<button @click="stateStore.toggleClient(item)"
									class="opacity-0 group-hover:opacity-100 transition-opacity">
									<UIcon name="i-heroicons-x-mark"
										class="w-3.5 h-3.5 text-[--color-text-muted] hover:text-red-500" />
								</button>
							</div>
							<div v-if="stateStore.selectedClients.length > 10"
								class="text-xs text-center text-[--color-text-muted] py-1">
								+{{ stateStore.selectedClients.length - 10 }} {{ t('more') }}
							</div>
						</div>
					</div>

					<!-- Individual Products Section -->
					<div v-if="stateStore.selectedProducts.length > 0">
						<div class="flex items-center justify-between mb-1.5">
							<span
								class="text-xs font-medium text-[--color-text-muted] uppercase flex items-center gap-1.5">
								<UIcon :name="icons.product" class="w-3.5 h-3.5" />
								{{ t('products') }}
							</span>
							<button @click="stateStore.clearProducts()" class="text-xs text-red-500 hover:text-red-600">
								{{ t('clear') }}
							</button>
						</div>
						<div class="space-y-1">
							<div v-for="item in stateStore.selectedProducts.slice(0, 10)" :key="item"
								class="flex items-center justify-between px-2 py-1.5 rounded bg-white dark:bg-[--color-background] text-xs group hover:bg-[--color-surface-hover]">
								<span class="font-mono truncate">{{ item }}</span>
								<button @click="stateStore.toggleProduct(item)"
									class="opacity-0 group-hover:opacity-100 transition-opacity">
									<UIcon name="i-heroicons-x-mark"
										class="w-3.5 h-3.5 text-[--color-text-muted] hover:text-red-500" />
								</button>
							</div>
							<div v-if="stateStore.selectedProducts.length > 10"
								class="text-xs text-center text-[--color-text-muted] py-1">
								+{{ stateStore.selectedProducts.length - 10 }} {{ t('more') }}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Servers Tab -->
			<div v-else-if="activeTab === 'servers'" class="p-3">
				<div v-if="serversLoading" class="flex justify-center py-6">
					<UIcon :name="icons.loading" class="w-5 h-5 animate-spin text-[--color-text-muted]" />
				</div>
				<div v-else-if="servers.length === 0" class="text-center py-6 text-sm text-[--color-text-muted]">
					{{ t('noServersFound') }}
				</div>
				<div v-else class="space-y-1 max-h-[35vh] overflow-y-auto pr-1">
					<label v-for="server in servers" :key="server.id"
						class="flex items-center gap-2.5 p-2 rounded cursor-pointer transition-colors" :class="stateStore.selectedServers.includes(server.id)
							? 'bg-opsi-blue/10 border border-opsi-blue/30'
							: 'hover:bg-[--color-surface-hover] border border-transparent'">
						<input type="checkbox" :checked="stateStore.selectedServers.includes(server.id)"
							@change="stateStore.toggleServer(server.id)"
							class="rounded border-[--color-border] text-opsi-blue focus:ring-opsi-blue" />
						<div class="flex-1 min-w-0">
							<div class="text-xs font-medium truncate">{{ server.id }}</div>
							<div v-if="server.description" class="text-[10px] text-[--color-text-muted] truncate">
								{{ server.description }}
							</div>
						</div>
						<UBadge v-if="server.isConfigServer" size="xs" color="primary" variant="soft">config</UBadge>
					</label>
				</div>
			</div>

			<!-- Client Groups Tab -->
			<div v-else-if="activeTab === 'client-groups'" class="p-3">
				<QuickpanelGroupSelectionTree group-type="client" />
			</div>

			<!-- Product Groups Tab -->
			<div v-else-if="activeTab === 'product-groups'" class="p-3">
				<QuickpanelGroupSelectionTree group-type="product" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const icons = useIcons()
const { t } = useI18n()
const stateStore = useStateStore()
const { getDepots } = useApiHelpers()

const activeTab = ref('servers')

// Data refs
const servers = ref<Array<{ id: string; description?: string; isConfigServer?: boolean }>>([])

// Loading states
const serversLoading = ref(false)

const hasAnySelections = computed(() => stateStore.hasAnySelections)

const tabs = computed(() => [
	{
		value: 'all',
		icon: 'i-heroicons-list-bullet',
		label: t('overview'),
		count: totalSelections.value
	},
	{
		value: 'servers',
		icon: 'i-heroicons-server-stack',
		label: t('servers'),
		count: stateStore.selectedServers.length
	},
	{
		value: 'client-groups',
		icon: 'i-heroicons-user-group',
		label: t('clientGroups'),
		count: stateStore.selectedClientGroups.length
	},
	{
		value: 'product-groups',
		icon: 'i-heroicons-cube',
		label: t('productGroups'),
		count: stateStore.selectedProductGroups.length
	}
])

const totalSelections = computed(() =>
	stateStore.selectedServers.length +
	stateStore.selectedClients.length +
	stateStore.selectedProducts.length +
	stateStore.selectedClientGroups.length +
	stateStore.selectedProductGroups.length
)

// Remove functions for the All Selections tab
function removeClientGroup(id: string) {
	stateStore.toggleClientGroup(id)
}

function removeProductGroup(id: string) {
	stateStore.toggleProductGroup(id)
}

// Load data when tab changes
watch(activeTab, async (tab) => {
	if (tab === 'servers' && servers.value.length === 0) {
		await loadServers()
	}
	// Client and product groups are now handled by GroupSelectionTree component
}, { immediate: true })

async function loadServers() {
	serversLoading.value = true
	try {
		const result = await getDepots({})
		if (result.data) {
			servers.value = result.data.map((d: any) => ({
				id: d.depotId || d.id || d,
				description: d.description || '',
				isConfigServer: d.type === 'OpsiConfigserver' || d.isConfigServer
			}))
		}
	} catch (e) {
		console.error('Failed to load servers:', e)
	} finally {
		serversLoading.value = false
	}
}

// Load servers immediately
onMounted(() => {
	loadServers()
})
</script>

<style scoped>
.quick-selection-tabs {
	min-height: 200px;
}

.tab-content {
	min-height: 150px;
}

/* Custom scrollbar */
.tab-content ::-webkit-scrollbar {
	width: 4px;
}

.tab-content ::-webkit-scrollbar-track {
	background: transparent;
}

.tab-content ::-webkit-scrollbar-thumb {
	background: var(--color-border);
	border-radius: 2px;
}

.tab-content ::-webkit-scrollbar-thumb:hover {
	background: var(--color-text-muted);
}
</style>
