Client Add New page - uses the reusable ClientsAddForm component.
<template>
    <LayoutsPageLayout :show-refresh="false">
        <div v-if="!canCreateClients || isReadOnly" class="flex items-center justify-center h-full">
            <SharedAlertInline color="warning" :title="$t('permissionDenied')">
                <template #description>{{ isReadOnly ? $t('opsiConfig.serverFeatures.readOnly.disabled') :
                    $t('opsiConfig.serverFeatures.clientCreation.disabled') }}</template>
            </SharedAlertInline>
        </div>
        <ClientsAddForm v-else @saved="handleSaved" />
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t: $t } = useI18n()
const { canCreateClients, isReadOnly } = useUserPermissions()

function handleSaved() {
    setTimeout(() => navigateTo('/clients'), 1500)
}
</script>