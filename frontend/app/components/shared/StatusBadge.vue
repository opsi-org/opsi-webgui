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
            return `${base} status-online`
        case 'offline':
        case 'neutral':
            return `${base} status-offline`
        case 'warning':
            return `${base} bg-(--color-opsi-warning)/15 text-(--color-opsi-warning)`
        case 'error':
            return `${base} bg-(--color-opsi-error)/15 text-(--color-opsi-error)`
        case 'info':
            return `${base} bg-(--color-opsi-blue)/15 text-(--color-opsi-blue)`
        default:
            return `${base} status-offline`
    }
})
</script>
