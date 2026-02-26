<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0

StatusBadge - A reusable status badge component.
-->
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
            return `${base} bg-[var(--color-opsi-warning)]/15 text-[var(--color-opsi-warning)]`
        case 'error':
            return `${base} bg-[var(--color-opsi-error)]/15 text-[var(--color-opsi-error)]`
        case 'info':
            return `${base} bg-[var(--color-opsi-blue)]/15 text-[var(--color-opsi-blue)]`
        default:
            return `${base} status-offline`
    }
})
</script>
