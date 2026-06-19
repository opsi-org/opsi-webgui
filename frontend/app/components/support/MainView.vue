<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  SupportMainView - Help page with professional support, community forum, documentation links and changelogs.
-->
<template>
    <LayoutsPageLayout :showFilter="false" :showRefresh="false">
        <div class="w-full p-4 flex flex-col gap-6 h-full min-h-[calc(100vh-120px)]">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CoreAppCard>
                    <template #header>
                        <CoreAppHeading :icon="icons.support" :text="$t('professionalSupport')" />
                    </template>
                    <p class="text-sm text-(--color-text-muted) mb-4">{{ $t('professionalSupportDescription') }}</p>
                    <CoreAppButton variant="soft" color="neutral" block as="a" :href="supportUrl" target="_blank">{{
                        $t('contactSupport') }}</CoreAppButton>
                </CoreAppCard>
                <CoreAppCard>
                    <template #header>
                        <CoreAppHeading :icon="icons.users" :text="$t('community')" />
                    </template>
                    <p class="text-sm text-(--color-text-muted) mb-4">{{ $t('communityDescription') }}</p>
                    <CoreAppButton variant="soft" color="neutral" block as="a" href="https://forum.opsi.org"
                        target="_blank">
                        {{ $t('visitOPSIForum') }}</CoreAppButton>
                </CoreAppCard>
                <CoreAppCard class="h-full">
                    <template #header>
                        <CoreAppHeading :icon="icons.document" :text="$t('documentation')" />
                    </template>
                    <p class="text-sm text-(--color-text-muted) mb-4">{{ $t('documentationDescription') }}</p>
                    <CoreAppButton variant="soft" color="neutral" block as="a" href="https://docs.opsi.org"
                        target="_blank">
                        {{ $t('openDocumentation') }}
                    </CoreAppButton>
                </CoreAppCard>
            </div>
            <div class="flex-1 min-h-0">
                <SupportWhatsNew />
            </div>
        </div>
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
const icons = useIcons()
const { t: $t, locale } = useI18n()
const supportUrl = computed(() => locale.value === 'de' ? 'https://opsi.org/de/services/support/' : 'https://opsi.org/en/services/support/')
</script>
