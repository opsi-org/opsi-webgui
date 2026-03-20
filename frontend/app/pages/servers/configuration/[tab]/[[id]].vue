Route: /servers/configuration/:tab/:id?
<template>
	<HostsConfigView :host-id="selectedServerId" host-type="server" :tab="activeTab" show-host-selector
		:on-cancel-leave="() => { manualServerId = routeServerId }" @update:host-id="updateSelectedServerId"
		@update:tab="updateActiveTab" @saved="handleSaved" />
</template>

<script setup lang="ts">
definePageMeta({
	layout: 'default',
	title: 'Server Configuration',
})

const VALID_TABS = ['parameters', 'attributes'] as const

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
		? `${selectedServerId.value} — ${activeTab.value}`
		: 'Server Configuration',
})
</script>
