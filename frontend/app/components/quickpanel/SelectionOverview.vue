<template>
	<div class="flex flex-col h-full min-h-0">
		<div v-if="!hasAny" class="text-xs text-(--color-text-muted) py-8 text-center">
			{{ t('noSelectionsYet') }}
		</div>

		<template v-else>
			<div class="flex items-center justify-between mb-2 shrink-0">
				<span class="text-xs text-(--color-text-muted)">{{ totalCount }} {{ t('total') }}</span>
				<UTooltip :text="t('clearAllSelections')">
					<UButton :icon="icons.clear" size="xs" variant="ghost" color="error" @click="clearAll" />
				</UTooltip>
			</div>

			<div class="flex-1 overflow-y-auto min-h-0 space-y-1.5">
				<div v-if="selectionStore.selectedServers.length > 0">
					<div class="flex items-center justify-between mb-1">
						<div class="flex items-center gap-1.5 text-xs font-medium">
							<UIcon :name="icons.server" class="w-3.5 h-3.5" />
							<span>{{ t('servers') }}</span>
							<UBadge size="xs" variant="subtle" color="neutral">{{ selectionStore.selectedServers.length
							}}</UBadge>
						</div>
						<UTooltip :text="t('clearAll')">
							<UButton :icon="icons.clear" size="xs" variant="ghost" color="error"
								@click="clearServers" />
						</UTooltip>
					</div>
					<div class="space-y-0.5">
						<div v-for="server in selectionStore.selectedServers" :key="server"
							class="flex items-center justify-between px-5 rounded text-xs  group hover:bg-(--color-surface-hover) transition-colors">
							<span class="truncate">{{ server }}</span>
							<UButton :icon="icons.clear" size="xs" variant="ghost" color="error"
								class="opacity-0 group-hover:opacity-100 transition-opacity"
								@click="removeServer(server)" />
						</div>
					</div>
				</div>

				<div v-if="selectionStore.selectedClients.length > 0">
					<div class="flex items-center justify-between mb-1">
						<div class="flex items-center gap-1.5 text-xs font-medium">
							<UIcon :name="icons.client" class="w-3.5 h-3.5" />
							<span>{{ t('clients') }}</span>
							<UBadge size="xs" variant="subtle" color="neutral">{{ selectionStore.selectedClients.length
							}}</UBadge>
						</div>
						<UTooltip :text="t('clearAll')">
							<UButton :icon="icons.clear" size="xs" variant="ghost" color="error"
								@click="selectionStore.clearClients()" />
						</UTooltip>
					</div>
					<div class="space-y-0.5 max-h-40 overflow-y-auto">
						<div v-for="client in selectionStore.selectedClients" :key="client"
							class="flex items-center justify-between px-5 rounded text-xs group hover:bg-(--color-surface-hover) transition-colors">
							<span class="truncate">{{ client }}</span>
							<UButton :icon="icons.clear" size="xs" variant="ghost" color="error"
								class="opacity-0 group-hover:opacity-100 transition-opacity"
								@click="selectionStore.toggleClient(client)" />
						</div>
					</div>
				</div>

				<div v-if="selectionStore.selectedProducts.length > 0">
					<div class="flex items-center justify-between mb-1">
						<div class="flex items-center gap-1.5 text-xs font-medium">
							<UIcon :name="icons.product" class="w-3.5 h-3.5" />
							<span>{{ t('products') }}</span>
							<UBadge size="xs" variant="subtle" color="neutral">{{ selectionStore.selectedProducts.length
							}}</UBadge>
						</div>
						<UTooltip :text="t('clearAll')">
							<UButton :icon="icons.clear" size="xs" variant="ghost" color="error"
								@click="selectionStore.clearProducts()" />
						</UTooltip>
					</div>
					<div class="space-y-0.5 max-h-40 overflow-y-auto">
						<div v-for="product in selectionStore.selectedProducts" :key="product"
							class="flex items-center justify-between px-5 rounded text-xs group hover:bg-(--color-surface-hover) transition-colors">
							<span class="truncate">{{ product }}</span>
							<UButton :icon="icons.clear" size="xs" variant="ghost" color="error"
								class="opacity-0 group-hover:opacity-100 transition-opacity"
								@click="selectionStore.toggleProduct(product)" />
						</div>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { useSelectionStore } from '~/stores/selectionStore'

const icons = useIcons()
const { t: i18nT } = useI18n()
const selectionStore = useSelectionStore()

const t = (key: string) => {
	const translated = i18nT(key)
	if (translated && translated !== key) return String(translated)
	return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

const hasAny = computed(() => selectionStore.hasAnySelection)

const totalCount = computed(() =>
	selectionStore.selectedServers.length +
	selectionStore.selectedClients.length +
	selectionStore.selectedProducts.length
)

function clearServers() {
	if (selectionStore.configServer) {
		selectionStore.setServers([selectionStore.configServer])
	} else {
		selectionStore.clearServers()
	}
}

function removeServer(serverId: string) {
	if (selectionStore.selectedServers.length === 1 && selectionStore.configServer) return
	selectionStore.toggleServer(serverId, 'quickpanel')
}

function clearAll() {
	selectionStore.clearAll()
	if (selectionStore.configServer) {
		selectionStore.setServers([selectionStore.configServer])
	}
}
</script>
