<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0

PageHeader - A reusable page header component with title and actions.
-->
<template>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center gap-3">
            <!-- <h1 class="text-xl md:text-2xl font-bold text-[var(--color-text)] dark:text-[var(--color-text)]">
                {{ title }}
            </h1> -->
            <slot name="tabs" />
        </div>
        <div class="flex flex-wrap items-center gap-2">
            <slot name="filters" />
            <UInput v-if="showSearch" v-model="searchModel" :placeholder="searchPlaceholder" :icon="icons.search"
                size="sm" class="w-full sm:w-48 md:w-64" />
            <slot name="actions" />
            <NuxtLink v-if="addLink" :to="addLink">
                <UButton :icon="icons.add" color="primary" size="sm">
                    <span class="hidden sm:inline">{{ addLabel || $t('addNew') }}</span>
                </UButton>
            </NuxtLink>
            <UButton v-if="showRefresh" :icon="icons.refresh" variant="outline" color="neutral" size="sm"
                :loading="loading" @click="$emit('refresh')" />
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    title: string
    showSearch?: boolean
    searchPlaceholder?: string
    addLink?: string
    addLabel?: string
    showRefresh?: boolean
    loading?: boolean
    modelValue?: string
}>()

const emit = defineEmits<{
    refresh: []
    'update:modelValue': [value: string]
}>()

const icons = useIcons()
const { t: $t } = useI18n()

const searchModel = computed({
    get: () => props.modelValue || '',
    set: (value: string) => emit('update:modelValue', value)
})
</script>
