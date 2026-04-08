Route: /clients/clone/:id?
Client Clone page - allows cloning an existing client.
<template>
    <LayoutsPageLayout>
        <div v-if="!canCreateClients || isReadOnly" class="flex items-center justify-center h-full p-8">
            <SharedAlertInline color="warning" :title="$t('permissionDenied')">
                <template #description>{{ isReadOnly ? $t('opsiConfig.serverFeatures.readOnly.disabled') :
                    $t('opsiConfig.serverFeatures.clientCreation.disabled') }}</template>
            </SharedAlertInline>
        </div>
        <ClientsCloneForm v-else :source-id="selectedClientId" show-source-selector
            :source-selector-placeholder="String($t('selectClient'))" @update:source-id="updateSelectedClientId"
            @saved="handleSuccess" />
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'default',
    title: 'Clone Client',
})

const { canCreateClients, isReadOnly } = useUserPermissions()
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
