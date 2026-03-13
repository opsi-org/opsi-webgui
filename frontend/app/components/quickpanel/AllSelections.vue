<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

AllSelections - Shows all current selections from the unified selectionStore.
-->
<template>
	<div class="space-y-2">
		<div v-if="!selectionStore.hasAnySelection" class="text-center py-6 text-xs text-[--color-text-muted]">
			<UIcon name="i-heroicons-information-circle" class="w-6 h-6 mb-1 mx-auto opacity-30" />
			{{ $t('noSelectionsYet') }}
		</div>
		<template v-else>
			<div v-for="section in sections" :key="section.key" v-show="section.items.length">
				<div class="flex items-center justify-between mb-1">
					<span class="text-xs text-[--color-text-muted] uppercase">{{ section.label }}</span>
					<button @click="section.clear" class="text-xs text-red-500 hover:underline">{{ $t('clearAll')
					}}</button>
				</div>
				<div class="space-y-0.5 max-h-32 overflow-y-auto">
					<div v-for="item in section.items" :key="item"
						class="flex items-center justify-between p-1 rounded bg-[--color-surface] text-xs group">
						<span class="truncate font-mono">{{ item }}</span>
						<button @click="section.remove(item)" class="opacity-0 group-hover:opacity-100 shrink-0">
							<UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
						</button>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { useSelectionStore } from '~/stores/selectionStore'

const { t: $t } = useI18n()
const selectionStore = useSelectionStore()

const sections = computed(() => [
	{
		key: 'depots',
		label: $t('depots'),
		items: selectionStore.selectedDepots,
		remove: (id: string) => selectionStore.toggleDepot(id),
		clear: () => selectionStore.clearDepots()
	},
	{
		key: 'clientGroups',
		label: $t('clientGroups'),
		items: selectionStore.selectedClientGroups,
		remove: (id: string) => selectionStore.toggleClientGroup(id),
		clear: () => selectionStore.clearClientGroups()
	},
	{
		key: 'clients',
		label: $t('clients'),
		items: selectionStore.selectedClients,
		remove: (id: string) => selectionStore.toggleClient(id),
		clear: () => selectionStore.clearClients()
	},
	{
		key: 'productGroups',
		label: $t('productGroups'),
		items: selectionStore.selectedProductGroups,
		remove: (id: string) => selectionStore.toggleProductGroup(id),
		clear: () => selectionStore.clearProductGroups()
	},
	{
		key: 'products',
		label: $t('products'),
		items: selectionStore.selectedProducts,
		remove: (id: string) => selectionStore.toggleProduct(id),
		clear: () => selectionStore.clearProducts()
	}
])
</script>
