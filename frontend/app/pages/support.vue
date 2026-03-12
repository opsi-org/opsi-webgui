<template>
    <LayoutsPageLayout :showSearch="false" :showRefresh="false">
        <div class="w-full p-4 flex flex-col gap-6 h-[calc(100vh-80px)]">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <UCard>
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon :name="icons.support" class="w-5 h-5 text-opsi-blue" />
                            <span class="font-medium">{{ $t('professionalSupport') }}</span>
                        </div>
                    </template>
                    <p class="text-sm text-[--color-text-muted) mb-4">{{ $t('professionalSupportDescription') }}</p>
                    <UButton variant="outline" color="neutral" block as="a" :href="supportUrl" target="_blank">{{
                        $t('contactSupport')
                        }}</UButton>
                </UCard>
                <UCard>
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon :name="icons.users" class="w-5 h-5 text-opsi-blue" />
                            <span class="font-medium">{{ $t('community') }}</span>
                        </div>
                    </template>
                    <p class="text-sm text-[--color-text-muted) mb-4">{{ $t('communityDescription') }}</p>
                    <UButton variant="outline" color="neutral" block as="a" href="https://forum.opsi.org"
                        target="_blank">{{
                            $t('visitOPSIForum') }}</UButton>
                </UCard>
                <UCard class="h-full">
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon :name="icons.document" class="w-5 h-5 text-opsi-blue" />
                            <span class="font-medium">{{ $t('documentation') }}</span>
                        </div>
                    </template>
                    <p class="text-sm text-[--color-text-muted) mb-4">{{ $t('documentationDescription') }}</p>
                    <UButton variant="outline" color="neutral" block as="a" href="https://docs.opsi.org"
                        target="_blank">
                        {{ $t('openDocumentation') }}
                    </UButton>
                </UCard>
            </div>
            <div class="flex-1 min-h-0">
                <SharedWhatsNew />
            </div>
        </div>
    </LayoutsPageLayout>
</template>


<script setup lang="ts">
definePageMeta({ layout: 'default' })
const icons = useIcons()
const { t: $t, locale } = useI18n()
const supportUrl = computed(() => locale.value === 'de' ? 'https://opsi.org/de/services/support/' : 'https://opsi.org/en/services/support/')
</script>
