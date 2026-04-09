<template>
	<div class="flex flex-col h-full min-h-0">
		<div v-if="!hasAny" class="text-xs text-(--color-text-muted) py-8 text-center">
			{{ t('noSelectionsYet') }}
		</div>

		<template v-else>
			<div class="flex items-center justify-between mb-2 shrink-0">
				<span class="text-xs text-(--color-text-muted)">{{ totalCount }} {{ t('total') }}</span>
				<UTooltip :text="t('clearAllSelections')">
					<UButton :icon="icons.xCircle" size="xs" variant="ghost" color="neutral" @click="clearAll" />
				</UTooltip>
			</div>

			<div class="flex-1 overflow-y-auto min-h-0 space-y-1.5">
				<div v-if="selectionStore.selectedServers.length > 0">
					<div class="flex items-center justify-between mb-1">
						<div class="flex items-center gap-1.5 text-xs font-medium">
							<UIcon :name="icons.server" class="w-3.5 h-3.5" />
							<h3 class="text-xs">{{ $t('servers') }}</h3>
							<UBadge size="xs" variant="subtle" color="neutral">{{ selectionStore.selectedServers.length
							}}</UBadge>
						</div>
						<UTooltip :text="t('clearAll')">
							<UButton :icon="icons.xCircle" size="xs" variant="ghost" color="neutral"
								@click="clearServers" />
						</UTooltip>
					</div>
					<div class="max-h-30 overflow-y-auto">
						<div v-for="server in selectionStore.selectedServers" :key="server"
							class="flex items-center justify-between px-5 rounded text-sm  group hover:bg-(--color-surface-hover) transition-colors">
							<span class="truncate">{{ server }}</span>
							<UButton :icon="icons.xCircle" size="xs" variant="ghost" color="neutral"
								class="opacity-0 group-hover:opacity-100 transition-opacity"
								@click="removeServer(server)" />
						</div>
					</div>
				</div>

				<div v-if="selectionStore.selectedClients.length > 0">
					<div class="flex items-center justify-between mb-1">
						<div class="flex items-center gap-1.5 text-xs font-medium">
							<UIcon :name="icons.client" class="w-3.5 h-3.5" />
							<h3 class="text-xs">{{ $t('clients') }}</h3>
							<UBadge size="xs" variant="subtle" color="neutral">{{ selectionStore.selectedClients.length
							}}</UBadge>
						</div>
						<UTooltip :text="t('clearAll')">
							<UButton :icon="icons.xCircle" size="xs" variant="ghost" color="neutral"
								@click="selectionStore.clearClients()" />
						</UTooltip>
					</div>
					<div class="max-h-36 overflow-y-auto">
						<div v-for="client in selectionStore.selectedClients" :key="client"
							class="flex items-center justify-between px-5 rounded text-sm group hover:bg-(--color-surface-hover) transition-colors">
							<span class="truncate">{{ client }}</span>
							<UButton :icon="icons.xCircle" size="xs" variant="ghost" color="neutral"
								class="opacity-0 group-hover:opacity-100 transition-opacity"
								@click="selectionStore.toggleClient(client)" />
						</div>
					</div>
				</div>

				<div v-if="selectionStore.selectedProducts.length > 0">
					<div class="flex items-center justify-between mb-1">
						<div class="flex items-center gap-1.5 text-xs font-medium">
							<UIcon :name="icons.product" class="w-3.5 h-3.5" />
							<h3 class="text-xs">{{ $t('products') }}</h3>
							<UBadge size="xs" variant="subtle" color="neutral">{{ selectionStore.selectedProducts.length
							}}</UBadge>
						</div>
						<UTooltip :text="t('clearAll')">
							<UButton :icon="icons.xCircle" size="xs" variant="ghost" color="neutral"
								@click="selectionStore.clearProducts()" />
						</UTooltip>
					</div>
					<div class="max-h-36 overflow-y-auto">
						<div v-for="product in selectionStore.selectedProducts" :key="product"
							class="flex items-center justify-between px-5 rounded text-sm group hover:bg-(--color-surface-hover) transition-colors">
							<span class="truncate">{{ product }}</span>
							<UButton :icon="icons.xCircle" size="xs" variant="ghost" color="neutral"
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
