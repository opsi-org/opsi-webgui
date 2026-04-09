<template>
    <UTooltip :text="tooltipText">
        <div
            class="flex flex-col items-center gap-0.5 rounded-lg py-1.5 cursor-help transition-colors hover:bg-(--color-surface-hover)">
            <div class="relative w-9 h-9 flex items-center justify-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="colorClasses.bg">
                    <UIcon :name="icon" class="w-4.5 h-4.5" :class="colorClasses.text" />
                </div>
                <UIcon :name="restricted ? icons.lock : icons.check"
                    class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full p-px" :class="colorClasses.badge" />
            </div>
            <span
                class="text-[11px] text-[--color-text-muted] font-medium leading-tight text-center max-w-13 line-clamp-2">{{
                label }}</span>
        </div>
    </UTooltip>
</template>

<script setup lang="ts">
const icons = useIcons()

const props = defineProps<{
    icon: string
    label: string
    restricted: boolean
    tooltipText: string
}>()

const colorClasses = computed(() => props.restricted
    ? { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', badge: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900' }
    : { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', badge: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900' },
)
</script>
