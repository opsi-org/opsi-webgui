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
                    <img src="~/assets/images/opsi-webgui-dark.svg" alt="OPSI" class="h-7 md:h-8" />
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
                <!-- Breadcrumb with Page Description -->
                <div
                    class="shrink-0 px-3 md:px-4 py-1.5 border-b border-[var(--color-border)] dark:border-[var(--color-border)] bg-white dark:bg-[var(--color-surface)]">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
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
                        <span v-if="pageDescription" class="text-xs text-[var(--color-text-muted)] hidden sm:inline">
                            {{ pageDescription }}
                        </span>
                    </div>
                </div>
                <div class="flex-1 p-3 md:p-4 overflow-auto">
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

        <!-- Mobile Quickpanel Drawer -->
        <Transition name="slide-up">
            <div v-if="quickpanelOpen && isMobile" class="fixed inset-0 z-50">
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-black/50" @click="quickpanelOpen = false" />
                <!-- Drawer Content -->
                <div
                    class="absolute bottom-0 left-0 right-0 bg-white dark:bg-[var(--color-surface)] rounded-t-2xl max-h-[80vh] overflow-auto">
                    <div class="p-4">
                        <!-- Drag Handle -->
                        <div class="flex justify-center mb-3">
                            <div class="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                        </div>

                        <div class="flex items-center justify-between mb-4">
                            <span class="text-base font-medium text-[var(--color-text)]">{{ t('settings') }}</span>
                            <button @click="quickpanelOpen = false"
                                class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                <UIcon :name="icons.close" class="w-5 h-5" />
                            </button>
                        </div>

                        <!-- Theme Section -->
                        <div class="mb-6">
                            <label class="block text-xs font-medium text-[var(--color-text-muted)] mb-3 uppercase">
                                {{ t('theme') }}
                            </label>
                            <div class="flex items-center gap-3">
                                <button @click="setTheme('light')"
                                    :class="['flex-1 py-3 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2',
                                        !isDarkMode
                                            ? 'bg-opsi-blue text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600']">
                                    <UIcon :name="icons.themeLight" class="w-5 h-5" />
                                    {{ t('light') }}
                                </button>
                                <button @click="setTheme('dark')"
                                    :class="['flex-1 py-3 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2',
                                        isDarkMode
                                            ? 'bg-opsi-blue text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600']">
                                    <UIcon :name="icons.themeDark" class="w-5 h-5" />
                                    {{ t('dark') }}
                                </button>
                            </div>
                        </div>

                        <!-- Language Section -->
                        <div class="mb-6">
                            <label class="block text-xs font-medium text-[var(--color-text-muted)] mb-3 uppercase">
                                {{ t('language') }}
                            </label>
                            <div class="flex flex-wrap gap-3">
                                <button v-for="locale in allLocales" :key="locale.code"
                                    @click="switchLocale(locale.code)"
                                    :class="['py-3 px-5 rounded-lg text-sm transition-colors',
                                        locale.code === currentLocale
                                            ? 'bg-opsi-blue text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600']">
                                    {{ locale.code.toUpperCase() }}
                                </button>
                            </div>
                        </div>

                        <!-- Version Info -->
                        <div class="pt-4 border-t border-[var(--color-border)]">
                            <p class="text-sm text-[var(--color-text-muted)]">
                                Version {{ $config.public.packageVersion || '1.0.0' }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/uiStore'

const icons = useIcons()
const uiStore = useUiStore()
const $route = useRoute()
const $config = useRuntimeConfig()
const colorMode = useColorMode()
const { t: i18nT, locale, locales, setLocale } = useI18n()

// Theme handling
const isDarkMode = computed(() => colorMode.value === 'dark')
function setTheme(theme: 'light' | 'dark') {
    colorMode.preference = theme
}

// Locale handling
interface LocaleInfo { code: string; name?: string }
const currentLocale = computed(() => locale.value || 'en')
const allLocales = computed(() => locales.value as LocaleInfo[])
function switchLocale(code: string) {
    setLocale(code as 'de' | 'en')
}

// Helper to format translation keys to readable text
const t = (key: string) => {
    const translated = i18nT(key)
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
        // If segment looks like a hostname (contains dots and no spaces), keep as-is
        // Otherwise, translate it
        const isHostname = segment.includes('.') && !segment.includes(' ')
        const label = isHostname ? segment : t(segment)
        crumbs.push({
            label,
            to: index < segments.length - 1 ? currentPath : undefined,
        })
    })

    return crumbs
})

// Page descriptions mapping - supports both exact paths and patterns
const getPageDescription = (path: string): string => {
    const normalizedPath = path.replace(/^\//, '') // Remove leading slash
    const segments = normalizedPath.split('/')
    const firstSegment = segments[0] || ''
    const lastSegment = segments[segments.length - 1] || ''

    // Exact path matches first
    const exactMatches: Record<string, string> = {
        'clients': t('clientsPageDescription') || 'View and manage opsi clients',
        'servers': t('serversPageDescription') || 'Manage depots and config servers',
        'products': t('productsPageDescription') || 'Browse and deploy software packages',
        'groups': t('groupsPageDescription') || 'Organize clients into logical groups',
        'admin/maintenance': t('adminMaintenancePageDescription') || 'System maintenance, backup and restore',
        'admin/diagnostics': t('adminDiagnosticsPageDescription') || 'Health checks, diagnostics and modules',
        'admin/terminal': t('adminTerminalPageDescription') || 'Direct server terminal access',
        'support': t('supportPageDescription') || 'Help and documentation resources',
    }

    if (exactMatches[normalizedPath]) {
        return exactMatches[normalizedPath]
    }

    // Pattern-based descriptions for sub-pages
    if (firstSegment === 'clients' && segments.length > 1) {
        if (segments[1] === 'config') {
            const clientId = segments[2]
            return clientId
                ? t('clientConfigPageDescription') || `Configuration for ${clientId}`
                : t('clientConfigSelectDescription') || 'Select a client to configure'
        }
        return t('clientDetailPageDescription') || 'Client details and actions'
    }

    if (firstSegment === 'servers' && segments.length > 1) {
        if (segments[1] === 'config') {
            const serverId = segments[2]
            return serverId
                ? t('serverConfigPageDescription') || `Configuration for ${serverId}`
                : t('serverConfigSelectDescription') || 'Select a server to configure'
        }
        return t('serverDetailPageDescription') || 'Server details and actions'
    }

    if (firstSegment === 'products' && segments.length > 1) {
        const productId = lastSegment
        return productId && productId !== 'config'
            ? t('productDetailPageDescription') || `Product details for ${productId}`
            : t('productConfigPageDescription') || 'Product configuration'
    }

    if (firstSegment === 'groups' && segments.length > 1) {
        return t('groupDetailPageDescription') || 'Group details and members'
    }

    // Fallback to first segment description
    return exactMatches[firstSegment] || ''
}

const pageDescription = computed(() => {
    return getPageDescription($route.path)
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

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
    opacity: 0;
}

.slide-up-enter-from>div:last-child,
.slide-up-leave-to>div:last-child {
    transform: translateY(100%);
}

.slide-up-enter-to>div:last-child,
.slide-up-leave-from>div:last-child {
    transform: translateY(0);
}
</style>