<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Route: /clients/clone/:id?
Client Clone page - allows cloning an existing client.
-->
<template>
    <ClientsCloneView :source-id="selectedClientId" show-source-selector
        :source-selector-placeholder="String($t('selectClient'))"
        :on-cancel-leave="() => { manualClientId = routeClientId }" @update:source-id="updateSelectedClientId"
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

// Update selected client ID and handle routing
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
