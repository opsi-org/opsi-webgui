StatusBadge - A reusable status badge component.
<template>
    <span :class="badgeClasses">
        {{ label }}
    </span>
</template>

<script setup lang="ts">
const props = defineProps<{
    status: 'online' | 'offline' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
    label: string
}>()

const badgeClasses = computed(() => {
    const base = 'px-2 py-1 text-xs rounded-full font-medium'

    switch (props.status) {
        case 'online':
        case 'success':
            return `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300`
        case 'offline':
        case 'neutral':
            return `${base} bg-(--color-surface) text-(--color-text-secondary)`
        case 'warning':
            return `${base} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300`
        case 'error':
            return `${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300`
        case 'info':
            return `${base} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300`
        default:
            return `${base} bg-(--color-surface) text-(--color-text-secondary)`
    }
})
</script>
