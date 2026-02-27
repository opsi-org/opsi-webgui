<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0

DetailPanel - A side panel component for showing details alongside main content.
Desktop: side-by-side split with resizable divider (default 50% width).
Mobile: overlay panel with close button.
-->
<template>
    <div class="h-full w-full relative" ref="containerRef">
        <!-- Main content -->
        <div :style="mainStyle" class="h-full overflow-auto transition-[width] duration-200">
            <slot name="main" />
        </div>

        <!-- Detail panel (Desktop: side-by-side, Mobile: overlay) -->
        <Transition :name="isMobile ? 'slide-up' : 'slide-in'">
            <div v-if="showPanel" :style="panelStyle" :class="panelClasses">
                <!-- Resize handle (desktop only) -->
                <div v-if="!isMobile" @mousedown="startResize"
                    class="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize bg-transparent hover:bg-opsi-blue/30 active:bg-opsi-blue/50 transition-colors z-10 group">
                    <div
                        class="absolute left-0.5 top-1/2 -translate-y-1/2 w-0.5 h-12 bg-gray-300 dark:bg-gray-600 rounded group-hover:bg-opsi-blue transition-colors" />
                </div>

                <!-- Panel header -->
                <div
                    class="shrink-0 border-b border-[var(--color-border)] dark:border-[var(--color-border)] px-4 py-3 flex items-center gap-3 bg-white dark:bg-[var(--color-surface)]">
                    <button v-if="isMobile" @click="$emit('close')"
                        class="p-1 rounded hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)] transition-colors">
                        <UIcon :name="icons.arrowLeft" class="w-5 h-5" />
                    </button>
                    <h3 class="flex-1 font-medium text-[var(--color-text)] dark:text-[var(--color-text)] truncate">
                        <slot name="title">Details</slot>
                    </h3>
                    <button @click="$emit('close')"
                        class="p-1 rounded hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)] transition-colors">
                        <UIcon :name="icons.close" class="w-5 h-5" />
                    </button>
                </div>
                <!-- Panel content -->
                <div class="flex-1 overflow-auto p-4">
                    <slot name="panel" />
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    showPanel: boolean
    defaultWidthPercent?: number
}>(), {
    defaultWidthPercent: 50
})

defineEmits<{
    close: []
}>()

const icons = useIcons()

const isMobile = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const panelWidthPercent = ref(props.defaultWidthPercent)
const isResizing = ref(false)
const minPanelPercent = 25
const maxPanelPercent = 75

onMounted(() => {
    const checkMobile = () => {
        isMobile.value = window.innerWidth < 768
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    onUnmounted(() => window.removeEventListener('resize', checkMobile))
})

const mainStyle = computed(() => {
    if (!props.showPanel || isMobile.value) return { width: '100%' }
    return { width: `${100 - panelWidthPercent.value}%` }
})

const panelStyle = computed(() => {
    if (isMobile.value) return {}
    return { width: `${panelWidthPercent.value}%` }
})

const panelClasses = computed(() => {
    if (isMobile.value) {
        return 'absolute inset-0 z-50 bg-white dark:bg-[var(--color-surface)] flex flex-col'
    }
    return 'absolute right-0 top-0 bottom-0 bg-white dark:bg-[var(--color-surface)] border-l border-[var(--color-border)] dark:border-[var(--color-border)] flex flex-col shadow-lg'
})

function startResize(e: MouseEvent) {
    e.preventDefault()
    isResizing.value = true
    const startX = e.clientX
    const containerWidth = containerRef.value?.clientWidth || window.innerWidth
    const startPercent = panelWidthPercent.value

    const onMove = (e: MouseEvent) => {
        const delta = startX - e.clientX
        const deltaPercent = (delta / containerWidth) * 100
        const newPercent = Math.min(maxPanelPercent, Math.max(minPanelPercent, startPercent + deltaPercent))
        panelWidthPercent.value = Math.round(newPercent)
    }

    const onUp = () => {
        isResizing.value = false
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
}
</script>

<style scoped>
.slide-in-enter-active,
.slide-in-leave-active {
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.slide-in-enter-from,
.slide-in-leave-to {
    transform: translateX(100%);
    opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
}
</style>
