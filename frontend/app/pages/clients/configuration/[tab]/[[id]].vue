Configuration page for clients, with tabs for parameters and attributes, and optional client selector.
Route: /clients/configuration/:tab/:id?
<template>
	<HostsConfigView :host-id="selectedClientId" host-type="client" :tab="activeTab" show-host-selector
		:host-selector-placeholder="String($t('selectClient'))"
		:on-cancel-leave="() => { manualClientId = routeClientId }" @update:host-id="updateSelectedClientId"
		@update:tab="updateActiveTab" @saved="handleSaved" />
</template>

<script setup lang="ts">
definePageMeta({
	layout: 'default',
	title: 'Client Configuration',
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

const routeClientId = computed((): string => {
	const id = route.params.id
	return (Array.isArray(id) ? id[0] : id) || ''
})

const manualClientId = ref<string>('')
const selectedClientId = computed(() => manualClientId.value)

const activeTab = computed({
	get: () => routeTab.value,
	set(v: string) {
		updateActiveTab(v)
	},
})

function updateActiveTab(v: string) {
	const id = selectedClientId.value
	const path = id ? `/clients/configuration/${v}/${id}` : `/clients/configuration/${v}`
	if (route.fullPath !== path) router.replace(path)
}

function updateSelectedClientId(id: string | null) {
	manualClientId.value = id || ''
	if (id === routeClientId.value) return
	const tab = activeTab.value
	router.replace(id ? `/clients/configuration/${tab}/${id}` : `/clients/configuration/${tab}`)
}

function handleSaved() {
}

watch(routeClientId, (id) => { manualClientId.value = id }, { immediate: true })

useHead({
	title: () => selectedClientId.value
		? `${selectedClientId.value} — ${activeTab.value}`
		: 'Client Configuration',
})
</script>
