<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

QuickPanel - A side panel for group selections, quick actions,and settings.
-->
<template>
	<!-- Quick Select Section -->
	<div class="mb-4">
		<label
			class="block text-xs font-medium text-(--color-text-muted) dark:text-(--color-text-muted) mb-2 uppercase">
			{{ t('quickSelect') }}
		</label>
		<div class="space-y-2">
			<!-- Depot Selection -->
			<div class="p-2 rounded bg-(--color-surface) dark:bg-(--color-background)">
				<div class="flex items-center justify-between text-xs mb-1">
					<span class="text-(--color-text-muted)">{{ t('selectedDepots') }}</span>
					<span class="font-medium">{{ stateStore.depots.length }}</span>
				</div>
				<div v-if="stateStore.depots.length > 0" class="flex flex-wrap gap-1">
					<span v-for="depot in stateStore.depots.slice(0, 5)" :key="depot"
						class="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded bg-opsi-blue/10 text-opsi-blue dark:bg-opsi-blue/20 dark:text-[#8fb3f5]">
						{{ depot }}
					</span>
					<span v-if="stateStore.depots.length > 5" class="text-[10px] text-(--color-text-muted)">
						+{{ stateStore.depots.length - 5 }}
					</span>
				</div>
			</div>
			<!-- Client Selection -->
			<div class="p-2 rounded bg-(--color-surface) dark:bg-(--color-background)">
				<div class="flex items-center justify-between text-xs mb-1">
					<span class="text-(--color-text-muted)">{{ t('selectedClients') }}</span>
					<div class="flex items-center gap-1">
						<span class="font-medium">{{ selectionStore.selectedClients.length }}</span>
						<button v-if="selectionStore.selectedClients.length > 0" @click="selectionStore.clearClients()"
							class="text-(--color-text-muted) hover:text-red-500 transition-colors">
							<UIcon :name="icons.close" class="w-3 h-3" />
						</button>
					</div>
				</div>
				<div v-if="selectionStore.selectedClients.length > 0" class="flex flex-wrap gap-1">
					<span v-for="client in selectionStore.selectedClients.slice(0, 8)" :key="client"
						class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 group cursor-pointer"
						@click="selectionStore.toggleClient(client)">
						{{ client }}
						<UIcon :name="icons.close" class="w-2.5 h-2.5 opacity-0 group-hover:opacity-100" />
					</span>
					<span v-if="selectionStore.selectedClients.length > 8"
						class="text-[10px] text-(--color-text-muted)">
						+{{ selectionStore.selectedClients.length - 8 }}
					</span>
				</div>
			</div>
			<!-- Product Selection -->
			<div class="p-2 rounded bg-(--color-surface) dark:bg-(--color-background)">
				<div class="flex items-center justify-between text-xs mb-1">
					<span class="text-(--color-text-muted)">{{ t('selectedProducts') }}</span>
					<div class="flex items-center gap-1">
						<span class="font-medium">{{ selectionStore.selectedProducts.length }}</span>
						<button v-if="selectionStore.selectedProducts.length > 0"
							@click="selectionStore.clearProducts()"
							class="text-(--color-text-muted) hover:text-red-500 transition-colors">
							<UIcon :name="icons.close" class="w-3 h-3" />
						</button>
					</div>
				</div>
				<div v-if="selectionStore.selectedProducts.length > 0" class="flex flex-wrap gap-1">
					<span v-for="product in selectionStore.selectedProducts.slice(0, 8)" :key="product"
						class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 group cursor-pointer"
						@click="selectionStore.toggleProduct(product)">
						{{ product }}
						<UIcon :name="icons.close" class="w-2.5 h-2.5 opacity-0 group-hover:opacity-100" />
					</span>
					<span v-if="selectionStore.selectedProducts.length > 8"
						class="text-[10px] text-(--color-text-muted)">
						+{{ selectionStore.selectedProducts.length - 8 }}
					</span>
				</div>
			</div>
			<!-- Clear All Button -->
			<button @click="clearAllSelections" v-if="hasSelections"
				class="w-full py-1.5 px-2 text-xs rounded text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
				<UIcon :name="icons.clear" class="w-3 h-3 mr-1" />
				{{ t('clearAllSelections') }}
			</button>
		</div>
	</div>

	<!-- Auto-Refresh Section -->
	<div class="mb-4">
		<label
			class="block text-xs font-medium text-(--color-text-muted) dark:text-(--color-text-muted) mb-2 uppercase">
			{{ t('autoRefresh') }}
		</label>
		<div
			class="p-3 rounded bg-(--color-surface) dark:bg-(--color-background) border border-(--color-border) dark:border-(--color-border)">
			<div class="flex items-center justify-between mb-2">
				<div class="flex items-center gap-2">
					<span v-if="messageBusStore.isConnected" class="w-2 h-2 rounded-full bg-green-500"
						:title="t('messageBusConnected')" />
					<span v-else class="w-2 h-2 rounded-full bg-red-400" :title="t('messageBusDisconnected')" />
					<span class="text-sm">{{ t('autoRefresh') }}</span>
				</div>
				<UCheckbox v-model="autoRefreshEnabled" size="sm" />
			</div>
			<p class="text-[10px] text-(--color-text-muted) leading-relaxed">
				{{ t('autoRefreshTooltip') }}
			</p>
		</div>
	</div>

	<!-- Quick Actions Section -->
	<div class="mb-4">
		<label
			class="block text-xs font-medium text-(--color-text-muted) dark:text-(--color-text-muted) mb-2 uppercase">
			{{ t('quickActions') }}
		</label>
		<div class="flex gap-2">
			<UButton size="sm" variant="soft" color="primary" class="flex-1" :disabled="stateStore.clients.length === 0"
				@click="navigateTo('/clients/products/LocalbootProduct')">
				<UIcon :name="icons.client" class="w-4 h-4 mr-1" />
				{{ t('clientProducts') }}
			</UButton>
		</div>
	</div>

	<!-- Settings Section -->
	<div class="mb-4">
		<label
			class="block text-xs font-medium text-(--color-text-muted) dark:text-(--color-text-muted) mb-2 uppercase">
			{{ t('settings') }}
		</label>

		<!-- Theme Selection -->
		<div class="mb-3">
			<span class="text-xs text-(--color-text-muted) mb-1 block">{{ t('theme') }}</span>
			<div class="flex items-center gap-2">
				<button @click="setTheme('light')"
					:class="['flex-1 py-2 px-3 rounded text-sm transition-colors flex items-center justify-center gap-2',
						!isDarkMode
							? 'bg-opsi-blue text-white'
							: 'bg-(--color-surface) dark:bg-(--color-background) hover:bg-(--color-surface-hover) dark:hover:bg-(--color-surface-hover)']">
					<UIcon :name="icons.themeLight" class="w-4 h-4" />
					{{ t('light') }}
				</button>
				<button @click="setTheme('dark')"
					:class="['flex-1 py-2 px-3 rounded text-sm transition-colors flex items-center justify-center gap-2',
						isDarkMode
							? 'bg-opsi-blue text-white'
							: 'bg-(--color-surface) dark:bg-(--color-background) hover:bg-(--color-surface-hover) dark:hover:bg-(--color-surface-hover)']">
					<UIcon :name="icons.themeDark" class="w-4 h-4" />
					{{ t('dark') }}
				</button>
			</div>
		</div>

		<!-- Language Selection -->
		<div>
			<span class="text-xs text-(--color-text-muted) mb-1 block">{{ t('language') }}</span>
			<div class="flex flex-wrap gap-2">
				<button v-for="loc in allLocales" :key="loc.code" @click="switchLocale(loc.code)"
					:class="['py-2 px-3 rounded text-sm transition-colors',
						loc.code === currentLocale
							? 'bg-opsi-blue text-white'
							: 'bg-(--color-surface) dark:bg-(--color-background) hover:bg-(--color-surface-hover) dark:hover:bg-(--color-surface-hover)']">
					{{ loc.code.toUpperCase() }}
				</button>
			</div>
		</div>
	</div>

	<!-- Footer with user info, session timer, version and logout -->
	<div class="mt-auto pt-4 border-t border-(--color-border) dark:border-(--color-border)">
		<!-- Read-only indicator -->
		<div v-if="userStore.readOnly"
			class="mb-2 px-2 py-1.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-1.5">
			<UIcon :name="icons.warning || 'i-heroicons-exclamation-triangle'" class="w-3.5 h-3.5 shrink-0" />
			<span>{{ t('readOnlyMode') }}</span>
		</div>
		<!-- Access levels (when some are restricted) -->
		<div v-if="!userStore.clientCreation || !userStore.hostGroupAccess || !userStore.productGroupAccess"
			class="mb-2 px-2 py-1 rounded bg-(--color-surface) dark:bg-(--color-background) text-xs text-(--color-text-muted)">
			<span class="block font-medium mb-0.5">{{ t('accessRestrictions') }}:</span>
			<span v-if="!userStore.clientCreation" class="block">- {{ t('noClientCreation') }}</span>
			<span v-if="!userStore.hostGroupAccess" class="block">- {{ t('noHostGroupAccess') }}</span>
			<span v-if="!userStore.productGroupAccess" class="block">- {{ t('noProductGroupAccess')
			}}</span>
		</div>
		<div class="flex items-center justify-between mb-2">
			<div>
				<p class="text-xs text-(--color-text-muted)">
					{{ t('currentUser') }}: <span class="font-medium">{{ userStore.username }}</span>
				</p>
			</div>
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
</template>
<script setup lang="ts">
import { useUiStore } from '~/stores/uiStore'
import { useUserStore } from '~/stores/userStore'
import { useStateStore } from '~/stores/stateStore'
import { useSelectionStore } from '~/stores/selectionStore'
import { useMessageBusStore } from '~/stores/messageBusStore'
import { useSessionTimer } from '~/composables/useSessionTimer'

const icons = useIcons()
const userStore = useUserStore()
const stateStore = useStateStore()
const selectionStore = useSelectionStore()
const messageBusStore = useMessageBusStore()
const { callLogout } = useApiHelpers()
const uiStore = useUiStore()

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

const hasSelections = computed(() =>
	stateStore.depots.length > 0 ||
	selectionStore.selectedClients.length > 0 ||
	selectionStore.selectedProducts.length > 0
)

function clearAllSelections() {
	stateStore.clearAll()
	selectionStore.clearAll()
}

const t = (key: string) => {
	const translated = i18nT(key)
	if (translated && translated !== key) return String(translated)
	// Convert camelCase to Title Case with spaces
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
