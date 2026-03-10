<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Route: /servers/configuration/:tab/:id?
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
			<HostsSelector v-model="manualServerId" type="server" allow-clear />
		</template>

		<template #saveActions>
			<UInput v-model="paramSearch" :placeholder="String($t('typeToFilter'))" size="sm"
				class="w-44 hidden sm:block" icon="i-lucide-search" />
			<SharedUnsavedChangesModal :config-ref="hostConfigTabsRef" size="sm" @save-all="saveAll"
				@discard-all="discardAll" />
		</template>


		<!-- Server default note when no server selected -->
		<template v-if="!selectedServerId && activeTab === 'parameters'">
			<div class="mb-2">
				<p class="text-xs text-muted italic">{{ $t('serverDefaultParams') }}</p>
			</div>
		</template>

		<HostsConfigTabs ref="hostConfigTabsRef" :host-id="selectedServerId || null" host-type="server" :tab="activeTab"
			:show-tabs="false" v-model:search="paramSearch" :show-change-banner="false" @saved="handleSaved" />
	</LayoutsPageLayout>
</template>

<script setup lang="ts">
definePageMeta({
	layout: 'default',
	title: 'Server Configuration',
})

const VALID_TABS = ['parameters', 'attributes'] as const

const { t: $t } = useI18n()
const route = useRoute()
const router = useRouter()

const routeTab = computed((): string => {
	const t = route.params.tab
	const val = (Array.isArray(t) ? t[0] : (t as string)) || ''
	return VALID_TABS.includes(val as any) ? val : 'parameters'
})

const routeServerId = computed((): string => {
	const id = route.params.id
	return (Array.isArray(id) ? id[0] : id) || ''
})

const manualServerId = ref<string>('')
const selectedServerId = computed(() => manualServerId.value)

const activeTab = computed({
	get: () => routeTab.value,
	set(v: string) {
		const id = selectedServerId.value
		const path = id ? `/servers/configuration/${v}/${id}` : `/servers/configuration/${v}`
		if (route.fullPath !== path) router.replace(path)
	},
})

watch(routeServerId, (id) => { manualServerId.value = id }, { immediate: true })

watch(manualServerId, (id) => {
	if (id === routeServerId.value) return
	const tab = activeTab.value
	router.replace(id ? `/servers/configuration/${tab}/${id}` : `/servers/configuration/${tab}`)
})

useHead({
	title: () => selectedServerId.value
		? `${selectedServerId.value} — ${activeTab.value}`
		: 'Server Configuration',
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
	manualServerId.value = routeServerId.value
})
</script>
