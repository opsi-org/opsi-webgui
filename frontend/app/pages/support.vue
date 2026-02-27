<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <LayoutsPageLayout :showSearch="false" :showRefresh="false">
        <template #tabs>
            <SharedTabsNav v-model="activeTab" :tabs="tabs" />
        </template>
        <template #actions>
            <UButton v-if="activeTab === 'documentation'" :icon="icons.externalLink" variant="outline" color="neutral"
                size="sm" as="a" href="https://docs.opsi.org" target="_blank">
                {{ $t('openInNewTab') }}
            </UButton>
        </template>

        <!-- Documentation Tab - Embedded iframe -->
        <div v-if="activeTab === 'documentation'" class="h-full flex flex-col">
            <!-- Iframe blocked message -->
            <div v-if="docsBlocked"
                class="flex-1 flex items-center justify-center bg-[var(--color-surface)] rounded-lg">
                <div class="text-center max-w-md p-8">
                    <UIcon :name="icons.externalLink" class="w-12 h-12 mx-auto mb-4 text-opsi-blue" />
                    <h3 class="text-lg font-semibold mb-2">{{ $t('documentationBlockedTitle') }}</h3>
                    <p class="text-sm text-[var(--color-text-muted)] mb-4">{{ $t('documentationBlockedMessage') }}</p>
                    <UButton color="primary" as="a" href="https://docs.opsi.org" target="_blank"
                        :icon="icons.externalLink">
                        {{ $t('openDocumentation') }}
                    </UButton>
                </div>
            </div>
            <!-- Loading state -->
            <div v-else-if="docsLoading"
                class="flex-1 flex items-center justify-center bg-[var(--color-surface)] rounded-lg">
                <div class="text-center">
                    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-opsi-blue mb-2" />
                    <p class="text-sm text-[var(--color-text-muted)]">{{ $t('loadingDocumentation') }}</p>
                </div>
            </div>
            <!-- Iframe -->
            <iframe v-show="!docsLoading && !docsBlocked" ref="docsIframe" src="https://docs.opsi.org"
                class="flex-1 w-full border-0 rounded-lg bg-white" @load="handleIframeLoad" @error="handleIframeError"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
                title="OPSI Documentation" />
        </div>

        <!-- Support Tab -->
        <div v-else-if="activeTab === 'support'" class="space-y-4 max-w-4xl p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UCard>
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon :name="icons.users" class="w-5 h-5 text-opsi-blue" />
                            <span class="font-medium">{{ $t('community') }}</span>
                        </div>
                    </template>
                    <p class="text-sm text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)] mb-4">
                        {{ $t('communityDescription') }}
                    </p>
                    <UButton variant="outline" color="neutral" block as="a" href="https://forum.opsi.org"
                        target="_blank">
                        {{ $t('visitOPSIForum') }}
                    </UButton>
                </UCard>

                <UCard>
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon :name="icons.support" class="w-5 h-5 text-opsi-blue" />
                            <span class="font-medium">{{ $t('professionalSupport') }}</span>
                        </div>
                    </template>
                    <p class="text-sm text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)] mb-4">
                        {{ $t('professionalSupportDescription') }}
                    </p>
                    <UButton variant="outline" color="neutral" block as="a" href="https://uib.de/support"
                        target="_blank">
                        {{ $t('contactSupport') }}
                    </UButton>
                </UCard>

                <UCard>
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon :name="icons.github" class="w-5 h-5 text-opsi-blue" />
                            <span class="font-medium">{{ $t('reportIssue') }}</span>
                        </div>
                    </template>
                    <p class="text-sm text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)] mb-4">
                        {{ $t('reportIssueDescription') }}
                    </p>
                    <UButton variant="outline" color="neutral" block as="a" href="https://github.com/opsi-org"
                        target="_blank">
                        {{ $t('openGitHub') }}
                    </UButton>
                </UCard>

                <UCard>
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon :name="icons.forum" class="w-5 h-5 text-opsi-blue" />
                            <span class="font-medium">{{ $t('faq') }}</span>
                        </div>
                    </template>
                    <p class="text-sm text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)] mb-4">
                        {{ $t('faqDescription') }}
                    </p>
                    <UButton variant="outline" color="neutral" block as="a"
                        href="https://docs.opsi.org/opsi-docs-en/4.3/faq.html" target="_blank">
                        {{ $t('viewFaq') }}
                    </UButton>
                </UCard>
            </div>
        </div>

        <!-- About Tab -->
        <div v-else-if="activeTab === 'about'" class="space-y-4 max-w-4xl p-4">
            <UCard>
                <template #header>
                    <span class="font-medium">{{ $t('aboutOpsi') }}</span>
                </template>
                <div class="space-y-3 text-sm">
                    <p class="text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)]">
                        {{ $t('aboutOpsiDescription') }}
                    </p>
                    <div class="flex flex-wrap gap-4 pt-2">
                        <div>
                            <span class="text-[var(--color-text-muted)]">{{ $t('version') }}:</span>
                            <span class="ml-2 font-medium">{{ $config.public.packageVersion }}</span>
                        </div>
                        <div>
                            <span class="text-[var(--color-text-muted)]">{{ $t('developer') }}:</span>
                            <span class="ml-2 font-medium">uib GmbH</span>
                        </div>
                        <div>
                            <span class="text-[var(--color-text-muted)]">{{ $t('license') }}:</span>
                            <span class="ml-2 font-medium">AGPL-3.0</span>
                        </div>
                    </div>
                </div>
            </UCard>

            <UCard>
                <template #header>
                    <span class="font-medium">{{ $t('links') }}</span>
                </template>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a href="https://opsi.org" target="_blank"
                        class="flex items-center gap-2 p-2 rounded hover:bg-[var(--color-surface)] transition-colors">
                        <UIcon :name="icons.globe" class="w-4 h-4 text-opsi-blue" />
                        <span class="text-sm">opsi.org</span>
                        <UIcon :name="icons.externalLink" class="w-3 h-3 text-[var(--color-text-muted)] ml-auto" />
                    </a>
                    <a href="https://github.com/opsi-org" target="_blank"
                        class="flex items-center gap-2 p-2 rounded hover:bg-[var(--color-surface)] transition-colors">
                        <UIcon :name="icons.github" class="w-4 h-4 text-opsi-blue" />
                        <span class="text-sm">GitHub</span>
                        <UIcon :name="icons.externalLink" class="w-3 h-3 text-[var(--color-text-muted)] ml-auto" />
                    </a>
                    <a href="https://forum.opsi.org" target="_blank"
                        class="flex items-center gap-2 p-2 rounded hover:bg-[var(--color-surface)] transition-colors">
                        <UIcon :name="icons.forum" class="w-4 h-4 text-opsi-blue" />
                        <span class="text-sm">Forum</span>
                        <UIcon :name="icons.externalLink" class="w-3 h-3 text-[var(--color-text-muted)] ml-auto" />
                    </a>
                    <a href="https://docs.opsi.org" target="_blank"
                        class="flex items-center gap-2 p-2 rounded hover:bg-[var(--color-surface)] transition-colors">
                        <UIcon :name="icons.document" class="w-4 h-4 text-opsi-blue" />
                        <span class="text-sm">{{ $t('documentation') }}</span>
                        <UIcon :name="icons.externalLink" class="w-3 h-3 text-[var(--color-text-muted)] ml-auto" />
                    </a>
                </div>
            </UCard>
        </div>
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const $config = useRuntimeConfig()

const activeTab = ref('documentation')
const docsLoading = ref(true)
const docsBlocked = ref(false)
const docsIframe = ref<HTMLIFrameElement | null>(null)
let loadTimeout: ReturnType<typeof setTimeout> | null = null

const tabs = [
    { label: String($t('documentation')), value: 'documentation' },
    { label: String($t('support')), value: 'support' },
    { label: String($t('about')), value: 'about' },
]

// Handle iframe load - check if it actually loaded content
function handleIframeLoad() {
    if (loadTimeout) clearTimeout(loadTimeout)
    docsLoading.value = false
    // Try to access iframe content - if blocked by X-Frame-Options this will fail
    try {
        const iframe = docsIframe.value
        if (iframe && iframe.contentWindow) {
            // If we can access contentDocument, it loaded. If null and no error, it might be blocked.
            const doc = iframe.contentDocument
            if (!doc || doc.URL === 'about:blank') {
                // May be blocked
                docsBlocked.value = true
            }
        }
    } catch {
        // Cross-origin - can't check, assume it loaded since no error
    }
}

// Handle iframe error
function handleIframeError() {
    if (loadTimeout) clearTimeout(loadTimeout)
    docsLoading.value = false
    docsBlocked.value = true
}

// Reset docs loading state when switching back to docs tab
watch(activeTab, (newTab) => {
    if (newTab === 'documentation') {
        docsLoading.value = true
        docsBlocked.value = false
        // Set a timeout to detect if iframe is blocked (won't get load event)
        loadTimeout = setTimeout(() => {
            if (docsLoading.value) {
                docsBlocked.value = true
                docsLoading.value = false
            }
        }, 10000) // 10 second timeout
    }
})

// Initial timeout for first load
onMounted(() => {
    loadTimeout = setTimeout(() => {
        if (docsLoading.value && activeTab.value === 'documentation') {
            docsBlocked.value = true
            docsLoading.value = false
        }
    }, 10000)
})

onUnmounted(() => {
    if (loadTimeout) clearTimeout(loadTimeout)
})
</script>
