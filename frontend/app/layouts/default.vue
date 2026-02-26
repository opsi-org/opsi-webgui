<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <div class="h-screen w-screen flex flex-col overflow-hidden">
        <!-- Top Bar -->
        <header class="bg-opsi-blue text-white h-12 flex items-center px-3 md:px-4 shadow-md shrink-0 z-50">
            <div class="flex items-center gap-2 md:gap-3">
                <button @click="toggleSidebar" class="p-2 rounded hover:bg-white/20 transition-colors">
                    <UIcon :name="sidebarOpen ? icons.menuClose : icons.menu" class="w-5 h-5" />
                </button>
                <NuxtLink to="/clients" class="flex items-center gap-2">
                    <img v-if="isDarkMode" src="~/assets/images/opsi_logo_bee_light.svg" alt="OPSI"
                        class="h-7 md:h-8" />
                    <img v-else src="~/assets/images/opsi_logo_bee_light.svg" alt="OPSI" class="h-7 md:h-8" />
                    <span class="text-base md:text-lg font-semibold hidden sm:inline">opsi-WebGUI</span>
                </NuxtLink>
            </div>
            <div class="flex-1" />
            <nav class="flex items-center gap-0.5 md:gap-1">
                <button @click="toggleQuickpanel" class="p-2 rounded hover:bg-white/20 transition-colors">
                    <UIcon :name="icons.quickPanel" class="w-5 h-5" />
                </button>
                <button @click="handleLogout" class="p-2 rounded hover:bg-white/20 transition-colors">
                    <UIcon :name="icons.logout" class="w-5 h-5" />
                </button>
            </nav>
        </header>

        <!-- Body -->
        <div class="flex-1 flex overflow-hidden relative">
            <!-- Sidebar Overlay (mobile) -->
            <div v-if="isMobile && sidebarOpen" class="absolute inset-0 bg-black/50 z-30"
                @click="sidebarOpen = false" />

            <!-- Sidebar -->
            <aside :class="[
                'shrink-0 transition-all duration-200 z-40',
                isMobile
                    ? sidebarOpen
                        ? 'absolute left-0 top-0 h-full w-64 shadow-lg'
                        : 'absolute -left-64 top-0 h-full w-64'
                    : sidebarOpen
                        ? 'w-52'
                        : 'w-14',
            ]">
                <CommonSidebar :collapsed="!sidebarOpen && !isMobile" :is-mobile="isMobile" />
            </aside>

            <!-- Main -->
            <main
                class="flex-1 overflow-auto bg-[var(--color-surface)] dark:bg-[var(--color-background)] flex flex-col min-w-0">
                <!-- Breadcrumb - Smaller size -->
                <div
                    class="shrink-0 px-3 md:px-4 py-1.5 border-b border-[var(--color-border)] dark:border-[var(--color-border)] bg-white dark:bg-[var(--color-surface)]">
                    <nav class="flex items-center gap-1.5 text-xs overflow-x-auto">
                        <template v-for="(crumb, i) in breadcrumbs" :key="i">
                            <UIcon v-if="i > 0" :name="icons.arrowRight"
                                class="w-2.5 h-2.5 text-[var(--color-text-muted)] shrink-0" />
                            <NuxtLink v-if="crumb.to" :to="crumb.to"
                                class="text-[var(--color-text-muted)] hover:text-opsi-blue whitespace-nowrap">
                                {{ crumb.label }}
                            </NuxtLink>
                            <span v-else
                                class="text-[var(--color-text)] dark:text-[var(--color-text)] font-medium whitespace-nowrap">
                                {{ crumb.label }}
                            </span>
                        </template>
                    </nav>
                </div>
                <div class="flex-1 p-3 md:p-4 overflow-hidden">
                    <slot />
                </div>
            </main>

            <!-- Quickpanel (desktop only) -->
            <aside v-if="quickpanelOpen && !isMobile"
                class="w-64 bg-white dark:bg-[var(--color-surface)] border-l border-[var(--color-border)] dark:border-[var(--color-border)] overflow-auto shrink-0">
                <div class="p-4">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-sm font-medium text-[var(--color-text)] dark:text-[var(--color-text)]">{{
                            t('settings')
                        }}</span>
                        <button @click="quickpanelOpen = false"
                            class="p-1 hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)] rounded">
                            <UIcon :name="icons.close" class="w-4 h-4" />
                        </button>
                    </div>

                    <!-- Theme Section -->
                    <div class="mb-4">
                        <label
                            class="block text-xs font-medium text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)] mb-2 uppercase">
                            {{ t('theme') }}
                        </label>
                        <div class="flex items-center gap-2">
                            <button @click="setTheme('light')"
                                :class="['flex-1 py-2 px-3 rounded text-sm transition-colors flex items-center justify-center gap-2',
                                    !isDarkMode
                                        ? 'bg-opsi-blue text-white'
                                        : 'bg-[var(--color-surface)] dark:bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] dark:hover:bg-[var(--color-surface-hover)]']">
                                <UIcon :name="icons.themeLight" class="w-4 h-4" />
                                {{ t('light') }}
                            </button>
                            <button @click="setTheme('dark')"
                                :class="['flex-1 py-2 px-3 rounded text-sm transition-colors flex items-center justify-center gap-2',
                                    isDarkMode
                                        ? 'bg-opsi-blue text-white'
                                        : 'bg-[var(--color-surface)] dark:bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] dark:hover:bg-[var(--color-surface-hover)]']">
                                <UIcon :name="icons.themeDark" class="w-4 h-4" />
                                {{ t('dark') }}
                            </button>
                        </div>
                    </div>

                    <!-- Language Section -->
                    <div class="mb-4">
                        <label
                            class="block text-xs font-medium text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)] mb-2 uppercase">
                            {{ t('language') }}
                        </label>
                        <div class="flex flex-wrap gap-2">
                            <button v-for="locale in allLocales" :key="locale.code" @click="switchLocale(locale.code)"
                                :class="['py-2 px-3 rounded text-sm transition-colors',
                                    locale.code === currentLocale
                                        ? 'bg-opsi-blue text-white'
                                        : 'bg-[var(--color-surface)] dark:bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] dark:hover:bg-[var(--color-surface-hover)]']">
                                {{ locale.code.toUpperCase() }}
                            </button>
                        </div>
                    </div>

                    <!-- Version Info -->
                    <div class="pt-4 border-t border-[var(--color-border)] dark:border-[var(--color-border)]">
                        <p class="text-xs text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)]">
                            Version {{ $config.public.packageVersion || '1.0.0' }}
                        </p>
                    </div>
                </div>
            </aside>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/uiStore'

const icons = useIcons()
const uiStore = useUiStore()
const $route = useRoute()
const $config = useRuntimeConfig()
const colorMode = useColorMode()
const { $t, $getLocale, $switchLocale, $getLocales } = useNuxtApp()

// Theme handling
const isDarkMode = computed(() => colorMode.value === 'dark')
function setTheme(theme: 'light' | 'dark') {
    colorMode.preference = theme
}

// Locale handling
interface LocaleInfo { code: string; name?: string }
const currentLocale = computed(() => $getLocale() || 'en')
const allLocales = computed(() => $getLocales() as LocaleInfo[])
function switchLocale(code: string) {
    $switchLocale(code)
}

// Helper to format translation keys to readable text
const t = (key: string) => {
    const translated = $t(key)
    if (translated && translated !== key) return String(translated)
    // Convert camelCase to Title Case with spaces
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

// Responsive state
const isMobile = ref(false)
const sidebarOpen = ref(false)
const quickpanelOpen = ref(false)

onMounted(() => {
    const checkMobile = () => {
        isMobile.value = window.innerWidth < 768
        if (!isMobile.value) {
            sidebarOpen.value = !uiStore.menuCollapsed
            quickpanelOpen.value = uiStore.quickpanelOpened
        } else {
            sidebarOpen.value = false
            quickpanelOpen.value = false
        }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    onUnmounted(() => window.removeEventListener('resize', checkMobile))
})

// Close mobile sidebar on route change
watch(
    () => $route.path,
    () => {
        if (isMobile.value) {
            sidebarOpen.value = false
        }
    }
)

const breadcrumbs = computed(() => {
    const path = $route.path
    const segments = path.split('/').filter(Boolean)
    if (!segments.length) return []

    const crumbs: { label: string; to?: string }[] = []
    let currentPath = ''

    segments.forEach((segment, index) => {
        currentPath += `/${segment}`
        const label = t(segment)
        crumbs.push({
            label,
            to: index < segments.length - 1 ? currentPath : undefined,
        })
    })

    return crumbs
})

function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
    if (!isMobile.value) {
        uiStore.menuCollapsed = !sidebarOpen.value
    }
}

function toggleQuickpanel() {
    quickpanelOpen.value = !quickpanelOpen.value
    if (!isMobile.value) {
        uiStore.quickpanelOpened = quickpanelOpen.value
    }
}

async function handleLogout() {
    await navigateTo('/login')
}
</script>
