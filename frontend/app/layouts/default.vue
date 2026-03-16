<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0
Default layout component with top bar, left sidebar, breadcrumb with page description, and main content area.
Also includes the quickpanel as a resizable right sidebar on desktop and a slide-up drawer on mobile.
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
                <LayoutsBreadCrumb />
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
                    <LayoutsQuickPanel />
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

                        <LayoutsQuickPanel />
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/uiStore'
import { useUserStore } from '~/stores/userStore'
import { useSessionTimer } from '~/composables/useSessionTimer'

const icons = useIcons()
const userStore = useUserStore()
const uiStore = useUiStore()

const { isWarning, formattedTime } = useSessionTimer(true)
const $route = useRoute()
const { t: i18nT } = useI18n()

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