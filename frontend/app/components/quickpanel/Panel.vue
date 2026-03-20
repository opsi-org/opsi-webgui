<template>
	<div class="flex flex-col h-full min-h-0">
		<div class="flex shrink-0 mb-3 -mx-4 px-4 gap-0.5 border-b border-(--color-border)">
			<UButton v-for="tab in tabs" :key="tab.id" variant="ghost"
				:color="activeTab === tab.id ? 'primary' : 'neutral'" size="xs"
				class="relative rounded-none border-b-2 px-2.5 py-2"
				:class="activeTab === tab.id ? 'border-opsi-blue' : 'border-transparent'" :title="t(tab.label)"
				@click="activeTab = tab.id">
				<UIcon :name="tab.icon" class="w-4 h-4" />
				<UBadge v-if="tab.count > 0" size="xs" variant="subtle"
					:color="activeTab === tab.id ? 'primary' : 'neutral'" class="ml-0.5 tabular-nums">{{ tab.count }}
				</UBadge>
			</UButton>
		</div>

		<div class="flex-1 min-h-0 overflow-hidden">
			<div v-show="activeTab === 'overview'" class="h-full overflow-y-auto">
				<QuickpanelSelectionOverview />
			</div>

			<div v-show="activeTab === 'servers'" class="h-full">
				<QuickpanelServerSelectionList />
			</div>

			<div v-show="activeTab === 'clients'" class="h-full">
				<QuickpanelGroupSelectionTree group-type="client" />
			</div>

			<div v-show="activeTab === 'products'" class="h-full">
				<QuickpanelGroupSelectionTree group-type="product" />
			</div>

			<div v-show="activeTab === 'settings'" class="h-full overflow-y-auto">
				<div class="space-y-4">
					<div
						class="p-3 rounded bg-(--color-surface) dark:bg-(--color-background) border border-(--color-border)">
						<div class="flex items-center justify-between mb-2">
							<div class="flex items-center gap-2">
								<span v-if="messageBusStore.isConnected" class="w-2 h-2 rounded-full bg-green-500" />
								<span v-else class="w-2 h-2 rounded-full bg-red-400" />
								<span class="text-sm">{{ t('autoRefresh') }}</span>
							</div>
							<UCheckbox v-model="autoRefreshEnabled" size="sm" />
						</div>
						<p class="text-[10px] text-(--color-text-muted) leading-relaxed">
							{{ t('autoRefreshTooltip') }}
						</p>
					</div>

					<div>
						<span class="text-xs text-(--color-text-muted) mb-1 block">{{ t('theme') }}</span>
						<div class="flex items-center gap-2">
							<UButton :variant="!isDarkMode ? 'solid' : 'outline'" color="primary" size="sm"
								class="flex-1" @click="setTheme('light')">
								<UIcon :name="icons.themeLight" class="w-4 h-4" />
								{{ t('light') }}
							</UButton>
							<UButton :variant="isDarkMode ? 'solid' : 'outline'" color="primary" size="sm"
								class="flex-1" @click="setTheme('dark')">
								<UIcon :name="icons.themeDark" class="w-4 h-4" />
								{{ t('dark') }}
							</UButton>
						</div>
					</div>

					<div>
						<span class="text-xs text-(--color-text-muted) mb-1 block">{{ t('language') }}</span>
						<div class="flex flex-wrap gap-2">
							<UButton v-for="loc in allLocales" :key="loc.code"
								:variant="loc.code === currentLocale ? 'solid' : 'outline'" color="primary" size="sm"
								@click="switchLocale(loc.code)">
								{{ loc.code.toUpperCase() }}
							</UButton>
						</div>
					</div>

					<UButton size="sm" variant="soft" color="primary" class="w-full"
						:disabled="selectionStore.selectedClients.length === 0"
						@click="navigateTo('/clients/products/LocalbootProduct')">
						<UIcon :name="icons.client" class="w-4 h-4 mr-1" />
						{{ t('clientProducts') }}
					</UButton>
				</div>
			</div>
		</div>

		<div class="mt-auto pt-3 border-t border-(--color-border) shrink-0">
			<div v-if="userStore.readOnly"
				class="mb-2 px-2 py-1.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-1.5">
				<UIcon :name="icons.warning" class="w-3.5 h-3.5 shrink-0" />
				<span>{{ t('readOnlyMode') }}</span>
			</div>
			<div v-if="!userStore.clientCreation || !userStore.hostGroupAccess || !userStore.productGroupAccess"
				class="mb-2 px-2 py-1 rounded bg-(--color-surface) dark:bg-(--color-background) text-xs text-(--color-text-muted)">
				<span class="block font-medium mb-0.5">{{ t('accessRestrictions') }}:</span>
				<span v-if="!userStore.clientCreation" class="block">- {{ t('noClientCreation') }}</span>
				<span v-if="!userStore.hostGroupAccess" class="block">- {{ t('noHostGroupAccess') }}</span>
				<span v-if="!userStore.productGroupAccess" class="block">- {{ t('noProductGroupAccess') }}</span>
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
			<UButton color="error" variant="soft" size="sm" class="w-full" @click="handleLogout">
				<UIcon :name="icons.logout" class="w-4 h-4 mr-1" />
				{{ t('logout') }}
			</UButton>
		</div>
	</div>
</template>
<script setup lang="ts">
import { useUiStore } from '~/stores/uiStore'
import { useUserStore } from '~/stores/userStore'
import { useSelectionStore } from '~/stores/selectionStore'
import { useMessageBusStore } from '~/stores/messageBusStore'
import { useSessionTimer } from '~/composables/useSessionTimer'

const icons = useIcons()
const userStore = useUserStore()
const selectionStore = useSelectionStore()
const messageBusStore = useMessageBusStore()
const { callLogout } = useApiHelpers()
const uiStore = useUiStore()

type TabId = 'overview' | 'servers' | 'clients' | 'products' | 'settings'

const activeTab = ref<TabId>('overview')

const tabs = computed(() => [
	{ id: 'overview' as TabId, label: 'overview', icon: icons.list, count: totalSelectionCount.value },
	{ id: 'servers' as TabId, label: 'servers', icon: icons.server, count: selectionStore.selectedServers.length },
	{ id: 'clients' as TabId, label: 'clients', icon: icons.client, count: selectionStore.selectedClients.length },
	{ id: 'products' as TabId, label: 'products', icon: icons.product, count: selectionStore.selectedProducts.length },
	{ id: 'settings' as TabId, label: 'settings', icon: icons.settings, count: 0 },
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
const colorMode = useColorMode()
const { t: i18nT, locale, locales, setLocale } = useI18n()

const isDarkMode = computed(() => uiStore.theme === 'dark')
function setTheme(theme: 'light' | 'dark') {
	colorMode.preference = theme
	uiStore.setTheme(theme)
}

interface LocaleInfo { code: string; name?: string }
const currentLocale = computed(() => locale.value || 'en')
const allLocales = computed(() => locales.value as LocaleInfo[])
function switchLocale(code: string) {
	setLocale(code as 'de' | 'en')
}

const t = (key: string) => {
	const translated = i18nT(key)
	if (translated && translated !== key) return String(translated)
	return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

async function handleLogout() {
	try {
		await callLogout()
	} catch (e) {
		console.warn('Logout API call failed:', e)
	}
	userStore.logout()
	await navigateTo('/login')
}
</script>
