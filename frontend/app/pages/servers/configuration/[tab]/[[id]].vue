<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ServerConfigurationPage - Route page for server host configuration tabs.
-->
<template>
	<div class="h-full flex flex-col min-h-0">
		<HostsConfigTabs :host-id="selectedServerId" host-type="server" :tab="activeTab" show-host-selector
			:readonly="isReadOnly || !hasServerWriteAccess" @update:host-id="updateSelectedServerId"
			@update:tab="updateActiveTab" @saved="handleSaved" />
	</div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { isReadOnly, hasServerWriteAccess } = useUserPermissions()

const VALID_TABS = ['parameters', 'attributes'] as const
const TAB_ALIASES: Record<string, string> = { parameter: 'parameters', attribute: 'attributes' }

const route = useRoute()
const router = useRouter()

const routeTab = computed((): string => {
	const t = route.params.tab
	const val = (Array.isArray(t) ? t[0] : (t as string)) || ''
	const normalized = TAB_ALIASES[val] || val
	return VALID_TABS.includes(normalized as (typeof VALID_TABS)[number]) ? normalized : 'parameters'
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
		updateActiveTab(v)
	},
})

function updateActiveTab(v: string) {
	const id = selectedServerId.value
	const path = id ? `/servers/configuration/${v}/${id}` : `/servers/configuration/${v}`
	if (route.fullPath !== path) router.replace(path)
}

function updateSelectedServerId(id: string | null) {
	manualServerId.value = id || ''
	if (id === routeServerId.value) return
	const tab = activeTab.value
	router.replace(id ? `/servers/configuration/${tab}/${id}` : `/servers/configuration/${tab}`)
}

function handleSaved() {
}

watch(routeServerId, (id) => { manualServerId.value = id }, { immediate: true })

useHead({
	title: () => selectedServerId.value
		? `${selectedServerId.value} - ${activeTab.value}`
		: 'Server Configuration',
})
</script>
