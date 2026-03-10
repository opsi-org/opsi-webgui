<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Configuration page for clients, with tabs for parameters and attributes, and optional client selector.
Route: /clients/configuration/:tab/:id?
-->
<template>
	<!-- Unsaved changes navigation warning -->
	<UModal v-model:open="showLeaveWarning" :title="$t('unsavedChanges')">
		<template #body>
			<p class="text-sm">{{ $t('navigateAwayWarning') }}</p>
		</template>
		<template #footer>
			<div class="flex gap-2 justify-end">
				<UButton variant="outline" color="neutral" @click="cancelLeave">{{ $t('stayOnPage') }}</UButton>
				<UButton color="error" @click="confirmLeave">{{ $t('leaveAnyway') }}</UButton>
			</div>
		</template>
	</UModal>

	<LayoutsPageLayout show-refresh :loading="loading" @refresh="refresh">
		<template #tabs>
			<SharedTabsNav v-model="activeTab" :tabs="configTabs" />
		</template>

		<template #filters>
			<HostsSelector v-model="manualClientId" :placeholder="String($t('selectClient'))" allow-clear />
		</template>

		<template #saveActions>
			<UInput v-model="paramSearch" :placeholder="String($t('typeToFilter'))" size="sm"
				class="w-44 hidden sm:block" icon="i-lucide-search" />
			<SharedUnsavedChangesModal :config-ref="hostConfigTabsRef" size="sm" @save-all="saveAll"
				@discard-all="discardAll" />
		</template>

		<!-- No Client Selected -->
		<div v-if="!selectedClientId && !loading" class="p-8 text-center border border-default rounded-lg">
			<UIcon :name="icons.client" class="w-12 h-12 mx-auto mb-3 opacity-50 text-muted" />
			<p class="text-muted">{{ $t('selectClientToViewConfig') }}</p>
		</div>

		<!-- Config content -->
		<HostsConfigTabs v-else ref="hostConfigTabsRef" :host-id="selectedClientId" host-type="client" :tab="activeTab"
			:show-tabs="false" v-model:search="paramSearch" :show-change-banner="false" @saved="handleSaved" />
	</LayoutsPageLayout>
</template>

<script setup lang="ts">
definePageMeta({
	layout: 'default',
	title: 'Client Configuration',
})

const VALID_TABS = ['parameters', 'attributes'] as const

const icons = useIcons()
const { t: $t } = useI18n()
const route = useRoute()
const router = useRouter()

const routeTab = computed((): string => {
	const t = route.params.tab
	const val = (Array.isArray(t) ? t[0] : (t as string)) || ''
	return VALID_TABS.includes(val as any) ? val : 'parameters'
})

const routeClientId = computed((): string => {
	const id = route.params.id
	return (Array.isArray(id) ? id[0] : id) || ''
})


const manualClientId = ref<string>('')
const selectedClientId = computed(() => manualClientId.value)

const activeTab = computed({
	get: () => routeTab.value,
	set(v: string) {
		const id = selectedClientId.value
		const path = id ? `/clients/configuration/${v}/${id}` : `/clients/configuration/${v}`
		if (route.fullPath !== path) router.replace(path)
	},
})

watch(routeClientId, (id) => { manualClientId.value = id }, { immediate: true })

watch(manualClientId, (id) => {
	if (id === routeClientId.value) return
	const tab = activeTab.value
	router.replace(id ? `/clients/configuration/${tab}/${id}` : `/clients/configuration/${tab}`)
})

useHead({
	title: () => selectedClientId.value
		? `${selectedClientId.value} — ${activeTab.value}`
		: 'Client Configuration',
})

const {
	loading,
	paramSearch,
	configTabs,
	hostConfigTabsRef,
	refresh,
	saveAll,
	discardAll,
	handleSaved,
	showLeaveWarning,
	confirmLeave,
	cancelLeave,
} = useHostConfigPage(() => {
	manualClientId.value = routeClientId.value
})
</script>
