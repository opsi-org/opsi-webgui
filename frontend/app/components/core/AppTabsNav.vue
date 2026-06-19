<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppTabsNav - Reusable tab navigation bar.
-->
<template>
    <UTabs :items="tabItems" :model-value="modelValue"
        @update:model-value="(val: string | number) => emit('update:modelValue', String(val))" :ui="{
            indicator: 'hidden',
            list: 'bg-(--color-surface) rounded-lg p-0.5 gap-0.5 before:hidden',
            trigger: [
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-100 cursor-pointer',
                'text-(--color-text-muted) hover:text-(--color-text) hover:bg-(--color-surface-hover)',
                'data-[state=active]:bg-opsi-blue data-[state=active]:text-white data-[state=active]:shadow-sm',
            ].join(' '),
            content: 'hidden',
        }">
        <template #default="{ item }">
            <CoreAppTooltip v-if="hideLabels || getTabTooltip(String(item.value))"
                :text="getTabTooltip(String(item.value)) || String(item.label)">
                <span class="inline-flex items-center gap-1.5">
                    <UIcon v-if="getTabIcon(String(item.value))" :name="getTabIcon(String(item.value))"
                        class="w-4 h-4 shrink-0" />
                    <span v-if="!hideLabels">{{ item.label }}</span>
                    <span v-else class="sr-only">{{ item.label }}</span>
                    <span v-if="getTabCount(String(item.value)) > 0" class="text-xs opacity-70">{{
                        getTabCount(String(item.value)) }}</span>
                </span>
            </CoreAppTooltip>
            <span v-else class="inline-flex items-center gap-1.5">
                <UIcon v-if="getTabIcon(String(item.value))" :name="getTabIcon(String(item.value))"
                    class="w-4 h-4 shrink-0" />
                <span>{{ item.label }}</span>
                <span v-if="getTabCount(String(item.value)) > 0" class="text-xs opacity-70">{{
                    getTabCount(String(item.value)) }}</span>
            </span>
        </template>
    </UTabs>
</template>

<script setup lang="ts">
interface Tab {
    label: string
    value: string
    icon?: string
    tooltip?: string
    count?: number
}

const props = defineProps<{
    tabs: Tab[]
    modelValue: string
    hideLabels?: boolean
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

const tabItems = computed(() =>
    props.tabs.map(tab => ({
        label: tab.label,
        value: tab.value,
    }))
)

function findTab(value: string): Tab | undefined {
    return props.tabs.find(t => t.value === value)
}

function getTabCount(value: string): number {
    return findTab(value)?.count ?? 0
}

function getTabIcon(value: string): string {
    return findTab(value)?.icon ?? ''
}

function getTabTooltip(value: string): string {
    return findTab(value)?.tooltip ?? ''
}
</script>