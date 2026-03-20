Route: /clients/logs/:id?
Client Logs page - displays logs for a selected client.
<template>
    <ClientsLogsView :client-id="selectedClientId" show-client-selector
        :client-selector-placeholder="String($t('selectClient'))" @update:client-id="updateClientId" />
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'default',
    title: 'Client Logs',
})

const route = useRoute()
const router = useRouter()

const routeClientId = computed<string>(() => {
    const id = route.params.id
    return (Array.isArray(id) ? id[0] : id) || ''
})

const manualClientId = ref<string>(routeClientId.value)

const selectedClientId = computed<string | null>(() =>
    routeClientId.value || manualClientId.value || null
)

watch(routeClientId, (id) => {
    if (id !== manualClientId.value) manualClientId.value = id
})

function updateClientId(id: string | null) {
    manualClientId.value = id || ''
    const target = id ? `/clients/logs/${id}` : '/clients/logs'
    if (route.fullPath !== target) router.replace(target)
}
</script>
