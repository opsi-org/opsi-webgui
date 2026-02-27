<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0

TabsNav - A reusable tabs navigation component.
-->
<template>
    <div class="flex rounded-md overflow-hidden border border-[var(--color-border)]">
        <button v-for="tab in tabs" :key="tab.value" @click="selectTab(tab.value)"
            class="px-3 py-1.5 text-sm font-medium transition-colors"
            :class="modelValue === tab.value
                ? 'bg-opsi-blue text-white'
                : 'bg-white dark:bg-[var(--color-surface)] text-[var(--color-text-secondary)] dark:text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)]'">
            <UIcon v-if="tab.icon" :name="tab.icon" class="w-4 h-4 mr-1.5 inline-block" />
            {{ tab.label }}
        </button>
    </div>
</template>

<script setup lang="ts">
interface Tab {
    label: string
    value: string
    icon?: string
}

const props = defineProps<{
    tabs: Tab[]
    modelValue: string
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

function selectTab(value: string) {
    emit('update:modelValue', value)
}
</script>
