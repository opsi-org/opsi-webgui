<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ClientClonePage - Route page for client cloning with optional source client ID.
-->
<template>
    <LayoutsPageLayout>
        <ClientsCloneForm :source-id="selectedClientId" show-source-selector
            :source-selector-placeholder="String($t('selectClient'))" @update:source-id="updateSelectedClientId"
            @saved="handleSuccess" />
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t: $t } = useI18n()
const route = useRoute()
const router = useRouter()

useHead({ title: () => `${$t('cloneClient')} - opsi-WebGUI` })

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
