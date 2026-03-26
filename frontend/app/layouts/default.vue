Default layout component with top bar, left sidebar, breadcrumb with page description, and main content area.
Also includes the quickpanel as a resizable right sidebar on desktop and a slide-up drawer on mobile.
<template>
    <div class="h-screen w-screen flex flex-col overflow-hidden">
        <header class="bg-opsi-blue text-white h-12 flex items-center px-3 md:px-4 shadow-md shrink-0 z-50">
            <div class="flex items-center gap-2 md:gap-3">
                <button @click="toggleSidebar" class="p-2 rounded hover:bg-white/20 transition-colors">
                    <UIcon :name="sidebarOpen ? icons.menuClose : icons.menu" class="w-5 h-5" />
                </button>
                <NuxtLink :to="defaultPage" class="flex items-center gap-2">
                    <img src="~/assets/images/opsi_webgui_wide_dark.svg" alt="OPSI" class="h-10" />
                </NuxtLink>
            </div>
            <div class="flex-1" />
            <nav class="flex items-center gap-0.5 md:gap-1">
                <div v-if="formattedTime && formattedTime !== '0:00' && isWarning"
                    class="flex items-center gap-1 text-xs px-2 py-1 rounded"
                    :class="isWarning ? 'bg-amber-500/20 animate-pulse font-semibold' : 'bg-white/10'"
                    :title="t('sessionExpiresIn')">
                    <UIcon :name="icons.clock" class="w-4 h-4" />
                    <span class="font-medium tabular-nums">{{ formattedTime }}</span>
                </div>
                <NuxtLink v-if="userStore.healthWorstCase && userStore.healthWorstCase !== 'ok'" to="/admin/diagnostics"
                    class="px-2.5 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5"
                    :class="{
                        'bg-amber-500/50 text-black hover:bg-amber-500/30': userStore.healthWorstCase === 'warning',
                        'bg-red-500/50 text-white hover:bg-red-500/30': userStore.healthWorstCase === 'error',
                    }" :title="healthCheckTooltip">
                    <UIcon :name="icons.diagnostics" class="w-4 h-4" />
                    <span class="tabular-nums">{{ userStore.healthCounts?.error || userStore.healthCounts?.warning || 0
                    }}</span>
                </NuxtLink>
                <UTooltip :text="messageBusStore.isConnected ? t('messageBusConnected') : t('messageBusDisconnected')">
                    <div class="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                        :class="messageBusStore.isConnected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'">
                        <span class="relative inline-flex w-5 h-5 items-center justify-center">
                            <img src="~/assets/images/opsi_logo_bee_dark.svg" alt="opsi" class="w-4 h-4" />
                            <span
                                class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[--color-background]"
                                :class="messageBusStore.isConnected ? 'bg-emerald-500' : 'bg-red-500'" />
                        </span>
                    </div>
                </UTooltip>
                <button @click="toggleQuickpanel"
                    class="p-2 rounded hover:bg-white/20 transition-colors flex items-center gap-1.5"
                    :title="t('quickPanel')">
                    <UIcon :name="icons.user" class="w-5 h-5" />
                    <span class="hidden md:inline text-sm">{{ userStore.username }}</span>
                    <UIcon :name="icons.quickPanel" class="w-4 h-4" />
                </button>
            </nav>
        </header>

        <div class="flex-1 flex overflow-hidden relative">
            <div v-if="isMobile && sidebarOpen" class="absolute inset-0 bg-black/50 z-30"
                @click="sidebarOpen = false" />

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

            <main
                class="flex-1 bg-(--color-surface) dark:bg-(--color-background) flex flex-col min-w-0 overflow-hidden">
                <LayoutsBreadCrumb />
                <Transition name="slide-down">
                    <div v-if="messageBusStore.changesDetected && !messageBusStore.autoRefresh"
                        class="mx-3 md:mx-4 mt-2 flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm">
                        <div class="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                            <UIcon :name="icons.info" class="w-4 h-4 shrink-0" />
                            <span>{{ t('changesDetected') }}: <strong>{{
                                messageBusStore.lastEventType?.replace('event:', '') || t('activity')
                                    }}</strong></span>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <UButton size="xs" color="warning" variant="soft" @click="$router.go(0)">
                                <UIcon :name="icons.refresh" class="w-3.5 h-3.5 mr-1" />
                                {{ t('refresh') }}
                            </UButton>
                            <UButton size="xs" variant="ghost" color="neutral"
                                @click="messageBusStore.setChangesDetected(false)">
                                <UIcon :name="icons.close" class="w-3.5 h-3.5" />
                            </UButton>
                        </div>
                    </div>
                </Transition>
                <div class="flex-1 p-3 md:p-4 overflow-auto min-h-0">
                    <slot />
                </div>
            </main>

            <Transition name="quickpanel-slide">
                <aside v-if="quickpanelOpen && !isMobile" :style="{ width: quickpanelWidth + 'px' }"
                    class="bg-white dark:bg-(--color-surface) border-l border-(--color-border) dark:border-(--color-border) overflow-auto shrink-0 flex flex-col relative">
                    <div class="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-opsi-blue/30 active:bg-opsi-blue/50 transition-colors z-10 group flex items-center justify-center"
                        @mousedown="startQuickpanelResize">
                        <div
                            class="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
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
                        <QuickpanelMainView />
                    </div>
                </aside>
            </Transition>
        </div>

        <Transition name="slide-up">
            <div v-if="quickpanelOpen && isMobile" class="fixed inset-0 z-50">
                <div class="absolute inset-0 bg-black/50" @click="quickpanelOpen = false" />
                <div
                    class="absolute bottom-0 left-0 right-0 bg-white dark:bg-(--color-surface) rounded-t-2xl max-h-[80vh] overflow-auto">
                    <div class="p-4">
                        <div class="flex justify-center mb-3">
                            <div class="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                        </div>

                        <div class="flex items-center justify-between mb-4">
                            <span class="text-base font-medium text-(--color-text)">{{ t('quickPanel') }}</span>
                            <UButton :icon="icons.close" size="sm" variant="ghost" color="neutral" class="rounded-full"
                                @click="quickpanelOpen = false" />
                        </div>

                        <QuickpanelMainView />
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/uiStore'
import { useUserStore } from '~/stores/userStore'
import { useMessageBusStore } from '~/stores/messageBusStore'
import { useSessionTimer } from '~/composables/useSessionTimer'
import { useMessageBus } from '~/composables/useMessagebus'

const icons = useIcons()
const userStore = useUserStore()
const uiStore = useUiStore()
const messageBusStore = useMessageBusStore()

// Establish persistent messagebus connection at the layout level
const { mount: mountMessageBus } = useMessageBus()

const { isWarning, formattedTime } = useSessionTimer(true)
const $route = useRoute()
const { t: i18nT } = useI18n()

const defaultPage = ref('/clients')

const healthCheckTooltip = computed(() => {
    const counts = userStore.healthCounts
    if (!counts) return t('healthCheck')
    const parts: string[] = []
    if (counts.error) parts.push(`${counts.error} ${t('errors')}`)
    if (counts.warning) parts.push(`${counts.warning} ${t('warnings')}`)
    return parts.length > 0 ? `${t('healthCheck')}: ${parts.join(', ')}` : t('healthCheck')
})

function updateDefaultPage() {
    if (typeof document === 'undefined') return
    const match = document.cookie.match(/(?:^|; )opsi-webgui-default-page=([^;]*)/)
    const stored = match?.[1] ? decodeURIComponent(match[1]) : null
    const validPages = ['/dashboard', '/clients', '/products', '/servers', '/admin/terminal', '/admin/maintenance', '/admin/diagnostics']
    defaultPage.value = (stored && validPages.includes(stored)) ? stored : '/clients'
}

const t = (key: string) => {
    const translated = i18nT(key)
    if (translated && translated !== key) return String(translated)
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
        const maxWidth = window.innerWidth * 0.5
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
    updateDefaultPage()
    mountMessageBus()
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
        updateDefaultPage()
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
    updateDefaultPage()
}
</script>

<style scoped>
.quickpanel-slide-enter-active {
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
}

.quickpanel-slide-leave-active {
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease;
}

.quickpanel-slide-enter-from {
    transform: translateX(100%);
    opacity: 0;
}

.quickpanel-slide-leave-to {
    transform: translateX(100%);
    opacity: 0;
}

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

.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.2s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
</style>