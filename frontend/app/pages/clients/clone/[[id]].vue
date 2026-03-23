Route: /clients/clone/:id?
Client Clone page - allows cloning an existing client.
<template>
    <ClientsCloneForm :source-id="selectedClientId" show-source-selector
        :source-selector-placeholder="String($t('selectClient'))" @update:source-id="updateSelectedClientId"
        @saved="handleSuccess" />
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'default',
    title: 'Clone Client',
})

const route = useRoute()
const router = useRouter()

const routeClientId = computed(() => {
    const id = route.params.id
    return (Array.isArray(id) ? id[0] : id) || ''
})

const manualClientId = ref<string>('')

const selectedClientId = computed(() => routeClientId.value || manualClientId.value)

function updateSelectedClientId(id: string | null) {
    manualClientId.value = id || ''
    if (id !== routeClientId.value) {
        router.replace(id ? `/clients/clone/${id}` : '/clients/clone')
    }
}

watch(routeClientId, (id) => {
    if (id !== manualClientId.value) {
        manualClientId.value = id
    }
}, { immediate: true })

function handleSuccess() {
    setTimeout(() => navigateTo('/clients'), 1500)
}
</script>
