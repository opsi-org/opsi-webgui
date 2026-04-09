DetailPanel - A side panel component for showing details alongside main content.
Desktop: side-by-side split with resizable divider (default 50% width).
Mobile: overlay panel with close button.
<template>
    <div class="h-full w-full relative bg-(--color-surface) dark:bg-(--color-background)" ref="containerRef">
        <div :style="mainStyle" class="h-full overflow-auto transition-[width] duration-200 min-w-0">
            <slot name="main" />
        </div>

        <Transition :name="isMobile ? 'slide-up' : 'slide-in'">
            <div v-if="showPanel" :style="panelStyle" :class="panelClasses">
                <div v-if="!isMobile" @mousedown="startResize"
                    class="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize bg-transparent hover:bg-opsi-blue/30 active:bg-opsi-blue/50 transition-colors z-10 group">
                    <div
                        class="absolute left-0.5 top-1/2 -translate-y-1/2 w-0.5 h-12 bg-gray-300 dark:bg-gray-600 rounded group-hover:bg-opsi-blue transition-colors" />
                </div>

                <div
                    class="shrink-0 border-b border-(--color-border) dark:border-(--color-border) px-4 py-3 bg-white dark:bg-(--color-surface)">
                    <div class="flex items-center gap-3">
                        <button v-if="isMobile" @click="$emit('close')"
                            class="p-1 rounded hover:bg-(--color-surface) dark:hover:bg-(--color-surface-hover) transition-colors">
                            <UIcon :name="icons.chevronLeft" class="w-3 h-3" />
                        </button>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-x-1 min-w-0">
                                <h3 class="text-sm text-(--color-text) truncate m-0">
                                    <slot name="title">Details</slot>
                                </h3>
                                <span v-if="$slots.subtitle" class="text-sm text-(--color-text-muted) truncate">
                                    <slot name="subtitle" />
                                </span>
                            </div>
                        </div>
                        <div class="flex items-center gap-1 shrink-0">
                            <slot name="panelActions" />
                            <button @click="$emit('close')"
                                class="p-1 rounded hover:bg-(--color-surface) dark:hover:bg-(--color-surface-hover) transition-colors">
                                <UIcon :name="icons.x" class="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
                <div
                    class="flex-1 overflow-y-auto overflow-x-auto p-4 bg-(--color-background) dark:bg-(--color-background) min-h-0 min-w-0 max-w-full">
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
        return 'absolute inset-0 z-50 bg-white dark:bg-(--color-surface) flex flex-col'
    }
    return 'absolute right-0 top-0 bottom-0 bg-white dark:bg-(--color-surface) border-l border-(--color-border) dark:border-(--color-border) flex flex-col shadow-lg'
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
