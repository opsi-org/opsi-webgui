<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
	<div class="space-y-2">
		<div v-if="!stateStore.hasAnySelections" class="text-center py-6 text-xs text-[--color-text-muted]">
			<UIcon name="i-heroicons-information-circle" class="w-6 h-6 mb-1 mx-auto opacity-30" />
			No items selected
		</div>
		<template v-else>
			<div v-for="section in sections" :key="section.key" v-show="section.items.length">
				<div class="flex items-center justify-between mb-1">
					<span class="text-xs text-[--color-text-muted] uppercase">{{ section.label }}</span>
					<button @click="section.clear" class="text-xs text-red-500 hover:underline">Clear</button>
				</div>
				<div class="space-y-0.5">
					<div v-for="item in section.items" :key="item"
						class="flex items-center justify-between p-1 rounded bg-[--color-surface] text-xs group">
						<span class="truncate">{{ item }}</span>
						<button @click="section.remove(item)" class="opacity-0 group-hover:opacity-100">
							<UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
						</button>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
const stateStore = useStateStore()

const sections = computed(() => [
	{ key: 'servers', label: 'Servers', items: stateStore.selectedServers, remove: (id: string) => stateStore.toggleServer(id), clear: () => stateStore.clearServers() },
	{ key: 'clientGroups', label: 'Client Groups', items: stateStore.selectedClientGroups, remove: (id: string) => stateStore.setClientGroups(stateStore.selectedClientGroups.filter(g => g !== id)), clear: () => stateStore.clearClientGroups() },
	{ key: 'clients', label: 'Clients', items: stateStore.selectedClients, remove: (id: string) => stateStore.toggleClient(id), clear: () => stateStore.clearClients() },
	{ key: 'productGroups', label: 'Product Groups', items: stateStore.selectedProductGroups, remove: (id: string) => stateStore.setProductGroups(stateStore.selectedProductGroups.filter(g => g !== id)), clear: () => stateStore.clearProductGroups() },
	{ key: 'products', label: 'Products', items: stateStore.selectedProducts, remove: (id: string) => stateStore.toggleProduct(id), clear: () => stateStore.clearProducts() }
])
</script>
