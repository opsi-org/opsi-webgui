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
                    <img src="~/assets/images/opsi_webgui_wide_dark.svg" alt="OPSI" class="h-10" />
                </NuxtLink>
            </div>
            <div class="flex-1" />
            <nav class="flex items-center gap-0.5 md:gap-1">
                <!-- Session Timer (warning indicator) -->
                <div v-if="isWarning"
                    class="hidden sm:flex items-center gap-1 text-xs bg-amber-500/20 px-2 py-1 rounded"
                    :title="t('sessionExpiresIn')">
                    <UIcon :name="icons.clock" class="w-4 h-4" />
                    <span>{{ formattedTime }}</span>
                </div>
                <!-- User indicator (click opens quickpanel) -->
                <button @click="toggleQuickpanel"
                    class="p-2 rounded hover:bg-white/20 transition-colors flex items-center gap-1.5"
                    :title="t('quickPanel')">
                    <UIcon :name="icons.user" class="w-5 h-5" />
                    <span class="hidden md:inline text-sm">{{ userStore.username }}</span>
                    <UIcon :name="icons.quickPanel" class="w-4 h-4" />
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
                <LayoutsSidebar :collapsed="!sidebarOpen && !isMobile" :is-mobile="isMobile" />
            </aside>

            <!-- Main -->
            <main
                class="flex-1 bg-(--color-surface) dark:bg-(--color-background) flex flex-col min-w-0 overflow-hidden">
                <!-- Breadcrumb with Page Description -->
                <div
                    class="shrink-0 px-3 md:px-4 py-1.5 border-b border-(--color-border) dark:border-(--color-border) bg-white dark:bg-(--color-surface)">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <nav class="flex items-center gap-1.5 text-xs overflow-x-auto">
                            <template v-for="(crumb, i) in breadcrumbs" :key="i">
                                <UIcon v-if="i > 0" :name="icons.arrowRight"
                                    class="w-2.5 h-2.5 text-(--color-text-muted) shrink-0" />
                                <NuxtLink v-if="crumb.to" :to="crumb.to"
                                    class="text-(--color-text-muted) hover:text-opsi-blue whitespace-nowrap">
                                    {{ crumb.label }}
                                </NuxtLink>
                                <span v-else
                                    class="text-(--color-text) dark:text-(--color-text) font-medium whitespace-nowrap">
                                    {{ crumb.label }}
                                </span>
                            </template>
                        </nav>
                        <span v-if="pageDescription" class="text-xs text-(--color-text-muted) hidden sm:inline">
                            {{ pageDescription }}
                        </span>
                    </div>
                </div>
                <div class="flex-1 p-3 md:p-4 overflow-auto min-h-0">
                    <slot />
                </div>
            </main>

            <!-- Quickpanel (desktop only) - Resizable -->
            <aside v-if="quickpanelOpen && !isMobile" :style="{ width: quickpanelWidth + 'px' }"
                class="bg-white dark:bg-(--color-surface) border-l border-(--color-border) dark:border-(--color-border) overflow-auto shrink-0 flex flex-col relative">
                <!-- Resize Handle -->
                <div class="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-opsi-blue/30 active:bg-opsi-blue/50 transition-colors z-10"
                    @mousedown="startQuickpanelResize" />
                <div class="p-4 flex-1 flex flex-col">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-sm font-medium text-(--color-text) dark:text-(--color-text)">{{
                            t('quickPanel')
                            }}</span>
                        <button @click="quickpanelOpen = false"
                            class="p-1 hover:bg-(--color-surface) dark:hover:bg-(--color-surface-hover) rounded">
                            <UIcon :name="icons.close" class="w-4 h-4" />
                        </button>
                    </div>

                    <!-- Quick Select Section -->
                    <div class="mb-4">
                        <label
                            class="block text-xs font-medium text-(--color-text-muted) dark:text-(--color-text-muted) mb-2 uppercase">
                            {{ t('quickSelect') }}
                        </label>
                        <div class="space-y-2">
                            <!-- Depot Selection -->
                            <div class="p-2 rounded bg-(--color-surface) dark:bg-(--color-background)">
                                <div class="flex items-center justify-between text-xs mb-1">
                                    <span class="text-(--color-text-muted)">{{ t('selectedDepots') }}</span>
                                    <span class="font-medium">{{ stateStore.depots.length }}</span>
                                </div>
                                <div v-if="stateStore.depots.length > 0" class="flex flex-wrap gap-1">
                                    <span v-for="depot in stateStore.depots.slice(0, 5)" :key="depot"
                                        class="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded bg-opsi-blue/10 text-opsi-blue dark:bg-opsi-blue/20 dark:text-[#8fb3f5]">
                                        {{ depot }}
                                    </span>
                                    <span v-if="stateStore.depots.length > 5"
                                        class="text-[10px] text-(--color-text-muted)">
                                        +{{ stateStore.depots.length - 5 }}
                                    </span>
                                </div>
                            </div>
                            <!-- Client Selection -->
                            <div class="p-2 rounded bg-(--color-surface) dark:bg-(--color-background)">
                                <div class="flex items-center justify-between text-xs mb-1">
                                    <span class="text-(--color-text-muted)">{{ t('selectedClients') }}</span>
                                    <div class="flex items-center gap-1">
                                        <span class="font-medium">{{ selectionStore.selectedClients.length }}</span>
                                        <button v-if="selectionStore.selectedClients.length > 0"
                                            @click="selectionStore.clearClients()"
                                            class="text-(--color-text-muted) hover:text-red-500 transition-colors">
                                            <UIcon :name="icons.close" class="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                <div v-if="selectionStore.selectedClients.length > 0" class="flex flex-wrap gap-1">
                                    <span v-for="client in selectionStore.selectedClients.slice(0, 8)" :key="client"
                                        class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 group cursor-pointer"
                                        @click="selectionStore.toggleClient(client)">
                                        {{ client }}
                                        <UIcon :name="icons.close"
                                            class="w-2.5 h-2.5 opacity-0 group-hover:opacity-100" />
                                    </span>
                                    <span v-if="selectionStore.selectedClients.length > 8"
                                        class="text-[10px] text-(--color-text-muted)">
                                        +{{ selectionStore.selectedClients.length - 8 }}
                                    </span>
                                </div>
                            </div>
                            <!-- Product Selection -->
                            <div class="p-2 rounded bg-(--color-surface) dark:bg-(--color-background)">
                                <div class="flex items-center justify-between text-xs mb-1">
                                    <span class="text-(--color-text-muted)">{{ t('selectedProducts') }}</span>
                                    <div class="flex items-center gap-1">
                                        <span class="font-medium">{{ selectionStore.selectedProducts.length }}</span>
                                        <button v-if="selectionStore.selectedProducts.length > 0"
                                            @click="selectionStore.clearProducts()"
                                            class="text-(--color-text-muted) hover:text-red-500 transition-colors">
                                            <UIcon :name="icons.close" class="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                <div v-if="selectionStore.selectedProducts.length > 0" class="flex flex-wrap gap-1">
                                    <span v-for="product in selectionStore.selectedProducts.slice(0, 8)" :key="product"
                                        class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 group cursor-pointer"
                                        @click="selectionStore.toggleProduct(product)">
                                        {{ product }}
                                        <UIcon :name="icons.close"
                                            class="w-2.5 h-2.5 opacity-0 group-hover:opacity-100" />
                                    </span>
                                    <span v-if="selectionStore.selectedProducts.length > 8"
                                        class="text-[10px] text-(--color-text-muted)">
                                        +{{ selectionStore.selectedProducts.length - 8 }}
                                    </span>
                                </div>
                            </div>
                            <!-- Clear All Button -->
                            <button @click="clearAllSelections" v-if="hasSelections"
                                class="w-full py-1.5 px-2 text-xs rounded text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                <UIcon :name="icons.clear" class="w-3 h-3 mr-1" />
                                {{ t('clearAllSelections') }}
                            </button>
                        </div>
                    </div>

                    <!-- Auto-Refresh Section -->
                    <div class="mb-4">
                        <label
                            class="block text-xs font-medium text-(--color-text-muted) dark:text-(--color-text-muted) mb-2 uppercase">
                            {{ t('autoRefresh') }}
                        </label>
                        <div
                            class="p-3 rounded bg-(--color-surface) dark:bg-(--color-background) border border-(--color-border) dark:border-(--color-border)">
                            <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center gap-2">
                                    <span v-if="messageBusStore.isConnected" class="w-2 h-2 rounded-full bg-green-500"
                                        :title="t('messageBusConnected') || 'MessageBus connected'" />
                                    <span v-else class="w-2 h-2 rounded-full bg-red-400"
                                        :title="t('messageBusDisconnected') || 'MessageBus disconnected'" />
                                    <span class="text-sm">{{ t('autoRefresh') }}</span>
                                </div>
                                <UToggle v-model="autoRefreshEnabled" size="sm" />
                            </div>
                            <p class="text-[10px] text-(--color-text-muted) leading-relaxed">
                                {{ t('autoRefreshTooltip') || 'When enabled, pages auto-refresh on changes.' }}
                            </p>
                        </div>
                    </div>

                    <!-- Quick Actions Section -->
                    <div class="mb-4">
                        <label
                            class="block text-xs font-medium text-(--color-text-muted) dark:text-(--color-text-muted) mb-2 uppercase">
                            {{ t('quickActions') }}
                        </label>
                        <div class="flex gap-2">
                            <UButton size="sm" variant="soft" color="primary" class="flex-1"
                                :disabled="stateStore.clients.length === 0"
                                @click="navigateTo('/clients/products/LocalbootProduct')">
                                <UIcon :name="icons.client" class="w-4 h-4 mr-1" />
                                {{ t('clientProducts') }}
                            </UButton>
                        </div>
                    </div>

                    <!-- Settings Section -->
                    <div class="mb-4">
                        <label
                            class="block text-xs font-medium text-(--color-text-muted) dark:text-(--color-text-muted) mb-2 uppercase">
                            {{ t('settings') }}
                        </label>

                        <!-- Theme Selection -->
                        <div class="mb-3">
                            <span class="text-xs text-(--color-text-muted) mb-1 block">{{ t('theme') }}</span>
                            <div class="flex items-center gap-2">
                                <button @click="setTheme('light')"
                                    :class="['flex-1 py-2 px-3 rounded text-sm transition-colors flex items-center justify-center gap-2',
                                        !isDarkMode
                                            ? 'bg-opsi-blue text-white'
                                            : 'bg-(--color-surface) dark:bg-(--color-background) hover:bg-(--color-surface-hover) dark:hover:bg-(--color-surface-hover)']">
                                    <UIcon :name="icons.themeLight" class="w-4 h-4" />
                                    {{ t('light') }}
                                </button>
                                <button @click="setTheme('dark')"
                                    :class="['flex-1 py-2 px-3 rounded text-sm transition-colors flex items-center justify-center gap-2',
                                        isDarkMode
                                            ? 'bg-opsi-blue text-white'
                                            : 'bg-(--color-surface) dark:bg-(--color-background) hover:bg-(--color-surface-hover) dark:hover:bg-(--color-surface-hover)']">
                                    <UIcon :name="icons.themeDark" class="w-4 h-4" />
                                    {{ t('dark') }}
                                </button>
                            </div>
                        </div>

                        <!-- Language Selection -->
                        <div>
                            <span class="text-xs text-(--color-text-muted) mb-1 block">{{ t('language') }}</span>
                            <div class="flex flex-wrap gap-2">
                                <button v-for="loc in allLocales" :key="loc.code" @click="switchLocale(loc.code)"
                                    :class="['py-2 px-3 rounded text-sm transition-colors',
                                        loc.code === currentLocale
                                            ? 'bg-opsi-blue text-white'
                                            : 'bg-(--color-surface) dark:bg-(--color-background) hover:bg-(--color-surface-hover) dark:hover:bg-(--color-surface-hover)']">
                                    {{ loc.code.toUpperCase() }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Footer with user info, session timer, version and logout -->
                    <div class="mt-auto pt-4 border-t border-(--color-border) dark:border-(--color-border)">
                        <!-- Read-only indicator -->
                        <div v-if="userStore.readOnly"
                            class="mb-2 px-2 py-1.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-1.5">
                            <UIcon :name="icons.warning || 'i-heroicons-exclamation-triangle'"
                                class="w-3.5 h-3.5 shrink-0" />
                            <span>{{ t('readOnlyMode') || 'Read-only mode' }}</span>
                        </div>
                        <!-- Access levels (when some are restricted) -->
                        <div v-if="!userStore.clientCreation || !userStore.hostGroupAccess || !userStore.productGroupAccess"
                            class="mb-2 px-2 py-1 rounded bg-(--color-surface) dark:bg-(--color-background) text-xs text-(--color-text-muted)">
                            <span class="block font-medium mb-0.5">{{ t('accessRestrictions') || 'Restrictions'
                            }}:</span>
                            <span v-if="!userStore.clientCreation" class="block">- {{ t('noClientCreation') }}</span>
                            <span v-if="!userStore.hostGroupAccess" class="block">- {{ t('noHostGroupAccess') }}</span>
                            <span v-if="!userStore.productGroupAccess" class="block">- {{ t('noProductGroupAccess')
                            }}</span>
                        </div>
                        <div class="flex items-center justify-between mb-2">
                            <div>
                                <p class="text-xs text-(--color-text-muted)">
                                    {{ t('currentUser') }}: <span class="font-medium">{{ userStore.username }}</span>
                                </p>
                                <!-- <p class="text-xs text-(--color-text-muted)">
                                    Version {{ $config.public.packageVersion || '1.0.0' }}
                                </p> -->
                            </div>
                            <div v-if="remainingSeconds > 0" class="flex items-center gap-1 text-xs"
                                :class="isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-(--color-text-muted)'">
                                <UIcon :name="icons.clock" class="w-3 h-3" />
                                <span>{{ formattedTimeText }}</span>
                            </div>
                        </div>
                        <UButton color="error" variant="soft" size="sm" class="w-full" @click="handleLogout">
                            <UIcon :name="icons.logout" class="w-4 h-4 mr-1" />
                            {{ t('logout') }}
                        </UButton>
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
                    class="absolute bottom-0 left-0 right-0 bg-white dark:bg-(--color-surface) rounded-t-2xl max-h-[80vh] overflow-auto">
                    <div class="p-4">
                        <!-- Drag Handle -->
                        <div class="flex justify-center mb-3">
                            <div class="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                        </div>

                        <div class="flex items-center justify-between mb-4">
                            <span class="text-base font-medium text-(--color-text)">{{ t('quickPanel') }}</span>
                            <button @click="quickpanelOpen = false"
                                class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                <UIcon :name="icons.close" class="w-5 h-5" />
                            </button>
                        </div>

                        <!-- Quick Select Section -->
                        <div class="mb-4">
                            <label class="block text-xs font-medium text-(--color-text-muted) mb-2 uppercase">
                                {{ t('quickSelect') }}
                            </label>
                            <div class="grid grid-cols-3 gap-2 mb-2">
                                <div class="p-2 rounded bg-gray-100 dark:bg-gray-700 text-center">
                                    <span class="block text-lg font-bold">{{ stateStore.depots.length }}</span>
                                    <span class="text-[10px] text-(--color-text-muted)">{{ t('depots') }}</span>
                                </div>
                                <div class="p-2 rounded bg-gray-100 dark:bg-gray-700 text-center">
                                    <span class="block text-lg font-bold">{{ stateStore.clients.length }}</span>
                                    <span class="text-[10px] text-(--color-text-muted)">{{ t('clients') }}</span>
                                </div>
                                <div class="p-2 rounded bg-gray-100 dark:bg-gray-700 text-center">
                                    <span class="block text-lg font-bold">{{ stateStore.products.length }}</span>
                                    <span class="text-[10px] text-(--color-text-muted)">{{ t('products') }}</span>
                                </div>
                            </div>
                            <button @click="clearAllSelections" v-if="hasSelections"
                                class="w-full py-2 text-sm rounded text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
                                {{ t('clearAllSelections') }}
                            </button>
                        </div>

                        <!-- Theme Section -->
                        <div class="mb-4">
                            <label class="block text-xs font-medium text-(--color-text-muted) mb-2 uppercase">
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
                        <div class="mb-4">
                            <label class="block text-xs font-medium text-(--color-text-muted) mb-2 uppercase">
                                {{ t('language') }}
                            </label>
                            <div class="flex flex-wrap gap-3">
                                <button v-for="loc in allLocales" :key="loc.code" @click="switchLocale(loc.code)"
                                    :class="['py-3 px-5 rounded-lg text-sm transition-colors',
                                        loc.code === currentLocale
                                            ? 'bg-opsi-blue text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600']">
                                    {{ loc.code.toUpperCase() }}
                                </button>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="pt-4 border-t border-(--color-border)">
                            <div class="flex items-center justify-between mb-2">
                                <div>
                                    <p class="text-sm text-(--color-text-muted)">
                                        {{ t('currentUser') }}: {{ userStore.username }}
                                    </p>
                                    <!-- <p class="text-sm text-(--color-text-muted)">
                                        Version {{ $config.public.packageVersion || '1.0.0' }}
                                    </p> -->
                                </div>
                                <div v-if="remainingSeconds > 0" class="flex items-center gap-1 text-sm"
                                    :class="isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-(--color-text-muted)'">
                                    <UIcon :name="icons.clock" class="w-4 h-4" />
                                    <span>{{ formattedTimeText }}</span>
                                </div>
                            </div>
                            <UButton color="error" variant="soft" size="md" class="w-full" @click="handleLogout">
                                <UIcon :name="icons.logout" class="w-4 h-4 mr-1" />
                                {{ t('logout') }}
                            </UButton>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/uiStore'
import { useUserStore } from '~/stores/userStore'
import { useStateStore } from '~/stores/stateStore'
import { useSelectionStore } from '~/stores/selectionStore'
import { useMessageBusStore } from '~/stores/messageBusStore'
import { useSessionTimer } from '~/composables/useSessionTimer'

const icons = useIcons()
const userStore = useUserStore()
const stateStore = useStateStore()
const selectionStore = useSelectionStore()
const messageBusStore = useMessageBusStore()
const { callLogout } = useApiHelpers()
const uiStore = useUiStore()

const autoRefreshEnabled = computed({
    get: () => messageBusStore.autoRefresh,
    set: (val: boolean) => messageBusStore.setAutoRefresh(val)
})

const { remainingSeconds, isWarning, formattedTime, formattedTimeText, refreshSession } = useSessionTimer(true)
const $route = useRoute()
const $config = useRuntimeConfig()
const colorMode = useColorMode()
const { t: i18nT, locale, locales, setLocale } = useI18n()

const isDarkMode = computed(() => uiStore.theme === 'dark')
function setTheme(theme: 'light' | 'dark') {
    colorMode.preference = theme
    uiStore.setTheme(theme)
}

interface LocaleInfo { code: string; name?: string }
const currentLocale = computed(() => locale.value || 'en')
const allLocales = computed(() => locales.value as LocaleInfo[])
function switchLocale(code: string) {
    setLocale(code as 'de' | 'en')
}

const hasSelections = computed(() =>
    stateStore.depots.length > 0 ||
    selectionStore.selectedClients.length > 0 ||
    selectionStore.selectedProducts.length > 0
)

function clearAllSelections() {
    stateStore.clearAll()
    selectionStore.clearAll()
}

const t = (key: string) => {
    const translated = i18nT(key)
    if (translated && translated !== key) return String(translated)
    // Convert camelCase to Title Case with spaces
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

const isMobile = ref(false)
const sidebarOpen = ref(false)
const quickpanelOpen = ref(false)

const DEFAULT_QUICKPANEL_WIDTH = 288
const MIN_QUICKPANEL_WIDTH = 250
const quickpanelWidth = ref(DEFAULT_QUICKPANEL_WIDTH)
const isResizingQuickpanel = ref(false)

function startQuickpanelResize(e: MouseEvent) {
    e.preventDefault()
    isResizingQuickpanel.value = true
    const startX = e.clientX
    const startWidth = quickpanelWidth.value

    const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = startX - moveEvent.clientX
        const maxWidth = window.innerWidth * 0.5 // Max 50% of viewport
        const newWidth = Math.min(Math.max(startWidth + deltaX, MIN_QUICKPANEL_WIDTH), maxWidth)
        quickpanelWidth.value = newWidth
    }

    const onMouseUp = () => {
        isResizingQuickpanel.value = false
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
}


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
        const isHostname = segment.includes('.') && !segment.includes(' ')
        const label = isHostname ? segment : t(segment)
        crumbs.push({
            label,
            to: index < segments.length - 1 ? currentPath : undefined,
        })
    })

    return crumbs
})

const getPageDescription = (path: string): string => {
    const normalizedPath = path.replace(/^\//, '')
    const segments = normalizedPath.split('/')
    const firstSegment = segments[0] || ''
    const lastSegment = segments[segments.length - 1] || ''

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
    try {
        await callLogout()
    } catch (e) {
        console.warn('Logout API call failed:', e)
    }
    userStore.logout()
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