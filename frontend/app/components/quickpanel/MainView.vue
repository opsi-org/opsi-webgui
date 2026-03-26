<template>
	<div class="flex flex-col h-full min-h-0">
		<div class="shrink-0 mb-2">
			<div class="text-[10px] font-semibold uppercase tracking-wide text-(--color-text-muted) mb-1">{{
				t('quickSelection') }}</div>
			<div class="flex gap-1.5 border-b border-(--color-border)">
				<UButton v-for="tab in selectionTabs" :key="tab.id" variant="soft"
					:color="activeTab === tab.id ? 'primary' : 'neutral'" size="xs"
					class="relative rounded-none border-b-2 px-2.5 py-2"
					:class="activeTab === tab.id ? 'border-opsi-blue' : 'border-transparent'" :title="t(tab.label)"
					@click="activeTab = tab.id">
					<UIcon :name="tab.icon" class="w-4 h-4" />
					<UBadge v-if="tab.count > 0" size="xs" variant="subtle"
						:color="activeTab === tab.id ? 'primary' : 'neutral'" class="ml-0.5 tabular-nums">{{ tab.count
						}}
					</UBadge>
				</UButton>
			</div>
		</div>
		<div class="min-h-0 overflow-hidden" style="max-height: 60vh;">
			<div v-show="activeTab === 'overview'" class="h-full overflow-y-auto">
				<QuickpanelSelectionOverview />
			</div>

			<div v-show="activeTab === 'servers'" class="h-full overflow-y-auto">
				<QuickpanelServerSelectionList :active="activeTab === 'servers'" />
			</div>

			<div v-show="activeTab === 'clients'" class="h-full overflow-y-auto">
				<QuickpanelGroupSelectionTree group-type="client" :active="activeTab === 'clients'" />
			</div>

			<div v-show="activeTab === 'products'" class="h-full overflow-y-auto">
				<QuickpanelGroupSelectionTree group-type="product" :active="activeTab === 'products'" />
			</div>
		</div>

		<div class="mt-auto shrink-0 border-t border-(--color-border) pt-3 space-y-3">
			<div>
				<div class="text-[10px] font-semibold uppercase tracking-wide text-(--color-text-muted) mb-1.5">{{
					t('quickActions') }}</div>
				<div class="flex items-center gap-1.5 flex-nowrap">
					<ClientsQuickActionsDropdown :client-ids="selectionStore.selectedClients" compact />
					<ProductsQuickActionsDropdown :products="[]" compact @applied="() => { }" />
				</div>
			</div>

			<div class="border-t border-(--color-border) pt-3">
				<div class="text-[10px] font-semibold uppercase tracking-wide text-(--color-text-muted) mb-1.5">{{
					t('settings') }}</div>
				<div class="space-y-1.5">
					<div
						class="flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-(--color-surface-hover) transition-colors">
						<UTooltip
							:text="(messageBusStore.isConnected ? t('messageBusConnected') : t('messageBusDisconnected')) + ' — ' + t('autoRefreshTooltip')">
							<div class="flex items-center gap-1.5 cursor-help">
								<span class="relative inline-flex w-4 h-4 items-center justify-center">
									<img src="~/assets/images/opsi_logo_bee_light.svg" alt="opsi"
										class="w-3.5 h-3.5 dark:hidden" />
									<img src="~/assets/images/opsi_logo_bee_dark.svg" alt="opsi"
										class="w-3.5 h-3.5 hidden dark:block" />
									<span
										class="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-white dark:border-gray-900"
										:class="messageBusStore.isConnected ? 'bg-green-500' : 'bg-red-400'" />
								</span>
								<span class="text-xs">{{ t('autoRefresh') }}</span>
							</div>
						</UTooltip>
						<UCheckbox v-model="autoRefreshEnabled" size="sm" />
					</div>
					<div class="flex items-center gap-1.5 flex-nowrap">
						<SettingsThemeToggle />
						<SettingsLanguageDropdown />
						<USelect v-model="defaultPage" :items="defaultPageOptions" size="xs" :title="$t('defaultPage')"
							class="min-w-27" />
					</div>
				</div>
			</div>

			<div class="border-t border-(--color-border) pt-3">
				<div v-if="userStore.readOnly"
					class="mb-2 px-2 py-1.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-1.5">
					<UIcon :name="icons.warning" class="w-3.5 h-3.5 shrink-0" />
					<span>{{ t('readOnlyMode') }}</span>
				</div>
				<div class="flex items-center justify-between mb-2">
					<p class="text-xs text-(--color-text-muted)">
						{{ t('currentUser') }}: <span class="font-medium">{{ userStore.username }}</span>
					</p>
					<div v-if="remainingSeconds > 0" class="flex items-center gap-1 text-xs"
						:class="isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-(--color-text-muted)'">
						<UIcon :name="icons.clock" class="w-3 h-3" />
						<span>{{ formattedTimeText }}</span>
					</div>
				</div>
				<UButton color="neutral" variant="soft" size="sm" class="w-full" @click="handleLogout">
					<UIcon :name="icons.logout" class="w-4 h-4 mr-1" />
					{{ t('logout') }}
				</UButton>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import { useUserStore } from '~/stores/userStore'
import { useSelectionStore } from '~/stores/selectionStore'
import { useMessageBusStore } from '~/stores/messageBusStore'
import { useSessionTimer } from '~/composables/useSessionTimer'

const icons = useIcons()
const userStore = useUserStore()
const selectionStore = useSelectionStore()
const messageBusStore = useMessageBusStore()
const { callLogout } = useApiHelpers()

type TabId = 'overview' | 'servers' | 'clients' | 'products'

const activeTab = ref<TabId>('overview')

const selectionTabs = computed(() => [
	{ id: 'overview' as TabId, label: 'overview', icon: icons.list, count: totalSelectionCount.value },
	{ id: 'servers' as TabId, label: 'servers', icon: icons.server, count: selectionStore.selectedServers.length },
	{ id: 'clients' as TabId, label: 'clients', icon: icons.client, count: selectionStore.selectedClients.length },
	{ id: 'products' as TabId, label: 'products', icon: icons.product, count: selectionStore.selectedProducts.length },
])

const totalSelectionCount = computed(() =>
	selectionStore.selectedServers.length +
	selectionStore.selectedClients.length +
	selectionStore.selectedProducts.length
)

const autoRefreshEnabled = computed({
	get: () => messageBusStore.autoRefresh,
	set: (val: boolean) => messageBusStore.setAutoRefresh(val)
})

const { remainingSeconds, isWarning, formattedTimeText } = useSessionTimer(true)
const { t: i18nT } = useI18n()


const DEFAULT_PAGE_KEY = 'opsi-webgui-default-page'
const defaultPageOptions = computed(() => [
	{ value: '/dashboard', label: t('dashboard') },
	{ value: '/servers', label: t('servers') },
	{ value: '/clients', label: t('clients') },
	{ value: '/products', label: t('products') },
	{ value: '/admin/terminal', label: `${t('admin')} - ${t('terminal')}` },
	{ value: '/admin/diagnostics', label: `${t('admin')} - ${t('diagnostics')}` },
	{ value: '/admin/maintenance', label: `${t('admin')} - ${t('maintenance')}` },
])

const defaultPage = ref('/clients')

onMounted(() => {
	const stored = getCookie(DEFAULT_PAGE_KEY)
	if (stored && defaultPageOptions.value.some(o => o.value === stored)) {
		defaultPage.value = stored
	}
	// Pre-fetch groups when panel mounts so they're ready when user switches tabs
	selectionStore.fetchClientGroups()
	selectionStore.fetchProductGroups()
})

watch(defaultPage, (val) => {
	document.cookie = `${DEFAULT_PAGE_KEY}=${val}; path=/; max-age=31536000; SameSite=Lax`
})

function getCookie(name: string): string | null {
	const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'))
	return match?.[1] ? decodeURIComponent(match[1]) : null
}

const t = (key: string) => {
	const translated = i18nT(key)
	if (translated && translated !== key) return String(translated)
	return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

async function handleLogout() {
	const currentPath = useRoute().fullPath
	try {
		await callLogout()
	} catch (e) {
		console.warn('Logout API call failed:', e)
	}
	userStore.logout()
	await navigateTo({ path: '/login', query: { redirect: currentPath } })
}
</script>
