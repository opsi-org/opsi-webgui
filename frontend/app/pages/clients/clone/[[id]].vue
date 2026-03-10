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
    <LayoutsPageLayout :show-search="false" :show-refresh="false">
        <template #filters>
            <HostsSelector v-model="manualClientId" :placeholder="String($t('selectClient'))" :allow-all="false"
                allow-clear />
        </template>

        <template #actions>
            <UButton variant="outline" color="neutral" @click="navigateTo('/clients')" :disabled="loading">
                {{ $t('button.cancel') }}
            </UButton>
        </template>

        <template #stats>
            <nav class="flex items-center gap-1 text-xs text-muted">
                <NuxtLink to="/clients" class="hover:text-opsi-blue">{{ $t('clients') }}</NuxtLink>
                <span class="mx-0.5">/</span>
                <span class="font-medium text-default">{{ $t('clone') }}</span>
                <template v-if="selectedClientId">
                    <span class="mx-0.5">/</span>
                    <span class="font-medium text-default truncate max-w-48">{{ selectedClientId }}</span>
                </template>
            </nav>
        </template>

        <!-- No Client Selected -->
        <div v-if="!selectedClientId && !loading" class="p-8 text-center border border-default rounded-lg">
            <UIcon :name="icons.clone" class="w-12 h-12 mx-auto mb-3 opacity-50 text-muted" />
            <p class="text-muted">{{ $t('selectClientToClone') }}</p>
        </div>

        <!-- Clone content -->
        <ClientsClone v-else :source-id="selectedClientId" @success="handleSuccess" />
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const route = useRoute()
const router = useRouter()

const routeClientId = computed(() => {
    const id = route.params.id
    return (Array.isArray(id) ? id[0] : id) || ''
})

const manualClientId = ref<string>('')
const selectedClientId = computed(() => manualClientId.value)
const loading = ref(false)

watch(routeClientId, (id) => { manualClientId.value = id }, { immediate: true })

watch(manualClientId, (id) => {
    if (id === routeClientId.value) return
    router.replace(id ? `/clients/clone/${id}` : '/clients/clone')
})

function handleSuccess() {
    setTimeout(() => navigateTo('/clients'), 1500)
}
</script>
