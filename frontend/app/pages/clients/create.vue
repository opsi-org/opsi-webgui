<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <div class="max-w-2xl mx-auto">
        <UCard>
            <template #header>
                <div class="flex items-center gap-3">
                    <UIcon :name="icons.add" class="w-5 h-5 text-opsi-blue" />
                    <h2 class="text-lg font-semibold">{{ t('addNew') }} {{ t('client') }}</h2>
                </div>
            </template>

            <form @submit.prevent="handleSubmit" class="space-y-4">
                <UFormGroup :label="$t('clientId')" required>
                    <UInput v-model="form.id" placeholder="client.domain.local" />
                </UFormGroup>

                <UFormGroup :label="$t('description')">
                    <UInput v-model="form.description" :placeholder="String($t('description'))" />
                </UFormGroup>

                <UFormGroup :label="$t('depot')">
                    <UInput v-model="form.depot" placeholder="depot1.domain.local" />
                </UFormGroup>

                <UFormGroup :label="$t('ipAddress')">
                    <UInput v-model="form.ipAddress" placeholder="192.168.1.100" />
                </UFormGroup>

                <UFormGroup :label="$t('macAddress')">
                    <UInput v-model="form.macAddress" placeholder="00:11:22:33:44:55" />
                </UFormGroup>

                <div class="flex justify-end gap-3 pt-4">
                    <UButton type="button" variant="outline" color="neutral" @click="navigateTo('/clients')">{{
                        $t('button.cancel')
                    }}</UButton>
                    <UButton type="submit" color="primary" :loading="loading">{{ t('button.save') }}</UButton>
                </div>
            </form>
        </UCard>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()

const t = (key: string) => {
    const translated = $t(key)
    if (translated && translated !== key) return String(translated)
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

const loading = ref(false)
const form = reactive({
    id: '',
    description: '',
    depot: '',
    ipAddress: '',
    macAddress: '',
})

const handleSubmit = async () => {
    loading.value = true
    await new Promise(r => setTimeout(r, 500))
    loading.value = false
    await navigateTo('/clients')
}
</script>
