<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <div class="space-y-4 max-w-4xl">
        <h1 class="text-xl md:text-2xl font-bold text-[var(--color-text)] dark:text-[var(--color-text)]">{{
            $t('support') }}</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UCard>
                <template #header>
                    <div class="flex items-center gap-2">
                        <UIcon :name="icons.info" class="w-5 h-5 text-opsi-blue" />
                        <span class="font-medium">{{ $t('documentation') }}</span>
                    </div>
                </template>
                <p class="text-sm text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)] mb-4">
                    Access the official OPSI documentation for guides, tutorials, and reference materials.
                </p>
                <UButton variant="outline" color="neutral" block as="a" href="https://docs.opsi.org" target="_blank">
                    {{ $t('openDocumentation') || 'Open Documentation' }}
                </UButton>
            </UCard>

            <UCard>
                <template #header>
                    <div class="flex items-center gap-2">
                        <UIcon :name="icons.users" class="w-5 h-5 text-opsi-blue" />
                        <span class="font-medium">{{ $t('community') || 'Community' }}</span>
                    </div>
                </template>
                <p class="text-sm text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)] mb-4">
                    Join the OPSI community forum to discuss, share experiences, and get help.
                </p>
                <UButton variant="outline" color="neutral" block as="a" href="https://forum.opsi.org" target="_blank">
                    {{ $t('visitOPSIForum') || 'Visit Forum' }}
                </UButton>
            </UCard>

            <UCard>
                <template #header>
                    <div class="flex items-center gap-2">
                        <UIcon :name="icons.support" class="w-5 h-5 text-opsi-blue" />
                        <span class="font-medium">{{ $t('professionalSupport') || 'Professional Support' }}</span>
                    </div>
                </template>
                <p class="text-sm text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)] mb-4">
                    Get professional support from uib GmbH for enterprise deployments.
                </p>
                <UButton variant="outline" color="neutral" block as="a" href="https://uib.de/support" target="_blank">
                    {{ $t('contactSupport') || 'Contact Support' }}
                </UButton>
            </UCard>

            <UCard>
                <template #header>
                    <div class="flex items-center gap-2">
                        <UIcon :name="icons.diagnostics" class="w-5 h-5 text-opsi-blue" />
                        <span class="font-medium">{{ $t('reportIssue') || 'Report Issue' }}</span>
                    </div>
                </template>
                <p class="text-sm text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)] mb-4">
                    Found a bug? Report issues on our GitHub repository.
                </p>
                <UButton variant="outline" color="neutral" block as="a" href="https://github.com/opsi-org"
                    target="_blank">
                    {{ $t('openGitHub') || 'Open GitHub' }}
                </UButton>
            </UCard>
        </div>

        <UCard>
            <template #header>
                <span class="font-medium">{{ $t('aboutOpsi') || 'About OPSI' }}</span>
            </template>
            <div class="space-y-3 text-sm">
                <p class="text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)]">
                    OPSI (open pc server integration) is an open source client management system for Windows, Linux, and
                    macOS clients.
                    It provides standardized software distribution, OS deployment, hardware and software inventory, and
                    more.
                </p>
                <div class="flex flex-wrap gap-4 pt-2">
                    <div>
                        <span class="text-[var(--color-text-muted)]">{{ $t('version') }}:</span>
                        <span class="ml-2 font-medium">{{ $config.public.packageVersion }}</span>
                    </div>
                    <div>
                        <span class="text-[var(--color-text-muted)]">{{ $t('developer') || 'Developer' }}:</span>
                        <span class="ml-2 font-medium">uib GmbH</span>
                    </div>
                    <div>
                        <span class="text-[var(--color-text-muted)]">{{ $t('license') || 'License' }}:</span>
                        <span class="ml-2 font-medium">AGPL-3.0</span>
                    </div>
                </div>
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const $config = useRuntimeConfig()
</script>
