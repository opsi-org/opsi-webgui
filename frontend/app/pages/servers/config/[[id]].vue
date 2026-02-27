<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <LayoutsPageLayout v-model="search" show-search :search-placeholder="String($t('filter'))" show-refresh
        :loading="loading" @refresh="fetchConfigs">

        <template #actions>
            <UButton v-if="hasChanges" color="primary" size="sm" :loading="saving" @click="saveAllChanges">
                <UIcon :name="icons.check" class="w-4 h-4 mr-1" />
                {{ $t('saveChanges') }}
                <UBadge v-if="changeCount > 0" color="neutral" variant="soft" size="xs" class="ml-1">
                    {{ changeCount }}
                </UBadge>
            </UButton>
            <UButton v-if="hasChanges" variant="outline" color="neutral" size="sm" @click="discardChanges">
                {{ $t('discard') }}
            </UButton>
        </template>

        <template #stats>
            <div class="flex items-center gap-4 text-sm">
                <span v-if="serverId" class="text-[var(--color-text-muted)]">
                    {{ $t('server') }}: <span class="font-medium text-[var(--color-text)]">{{ serverId }}</span>
                </span>
                <span class="text-[var(--color-text-muted)]">
                    {{ $t('categories') }}: <span class="font-medium">{{ categoryCount }}</span>
                </span>
                <span class="text-[var(--color-text-muted)]">
                    {{ $t('items') }}: <span class="font-medium">{{ itemCount }}</span>
                </span>
            </div>
        </template>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
            <UIcon :name="icons.loading" class="w-8 h-8 animate-spin text-opsi-blue" />
        </div>

        <!-- Tree View -->
        <div v-else class="space-y-2">
            <!-- No configs found -->
            <div v-if="filteredCategories.length === 0" class="text-center py-8 text-[var(--color-text-muted)]">
                <UIcon :name="icons.config" class="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{{ $t('noConfigsFound') }}</p>
            </div>

            <!-- Category Tree Nodes -->
            <div v-for="category in filteredCategories" :key="category.name"
                class="border border-[var(--color-border)] rounded-lg overflow-hidden">

                <!-- Category Header (always visible) -->
                <button @click="toggleCategory(category.name)"
                    class="w-full flex items-center justify-between p-3 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors text-left">
                    <div class="flex items-center gap-2">
                        <UIcon :name="expandedCategories.has(category.name) ? icons.arrowDown : icons.arrowRight"
                            class="w-4 h-4 text-[var(--color-text-muted)]" />
                        <UIcon :name="icons.config" class="w-4 h-4 text-opsi-blue" />
                        <span class="font-medium capitalize">{{ category.name }}</span>
                        <UBadge color="neutral" variant="soft" size="xs">{{ category.items.length }}</UBadge>
                        <UBadge v-if="getCategoryChangeCount(category.name) > 0" color="warning" variant="soft"
                            size="xs">
                            {{ getCategoryChangeCount(category.name) }} {{ $t('changed') }}
                        </UBadge>
                    </div>
                    <UButton size="xs" variant="ghost" :icon="icons.arrowDown"
                        :class="{ 'rotate-180': expandedCategories.has(category.name) }" @click.stop />
                </button>

                <!-- Category Items (collapsible) -->
                <Transition name="collapse">
                    <div v-if="expandedCategories.has(category.name)" class="border-t border-[var(--color-border)]">
                        <div v-for="item in filterCategoryItems(category.items)" :key="item.configId"
                            class="border-b border-[var(--color-border)] last:border-b-0">

                            <!-- Config Item Row -->
                            <div
                                class="flex flex-col md:flex-row md:items-center gap-2 p-3 hover:bg-[var(--color-surface-hover)] transition-colors">
                                <!-- Config ID and Description -->
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2">
                                        <span class="font-mono text-sm truncate" :title="item.configId">
                                            {{ item.configId }}
                                        </span>
                                        <UBadge v-if="!item.editable" color="neutral" variant="subtle" size="xs">
                                            {{ $t('readonly') }}
                                        </UBadge>
                                        <UBadge v-if="hasItemChanged(item.configId)" color="warning" variant="soft"
                                            size="xs">
                                            {{ $t('modified') }}
                                        </UBadge>
                                    </div>
                                    <p v-if="item.description" class="text-xs text-[var(--color-text-muted)] truncate"
                                        :title="item.description">
                                        {{ item.description }}
                                    </p>
                                </div>

                                <!-- Value Editor -->
                                <div class="md:w-64 shrink-0">
                                    <!-- Boolean value -->
                                    <UToggle v-if="item.type === 'BoolConfig'" :model-value="getEditValue(item)"
                                        :disabled="!item.editable"
                                        @update:model-value="(v: boolean) => setEditValue(item, v)" />

                                    <!-- Select from possible values -->
                                    <USelect v-else-if="item.possibleValues?.length && !item.multiValue"
                                        :model-value="String(getEditValue(item))"
                                        :options="item.possibleValues.map((v: unknown) => ({ label: String(v), value: String(v) }))"
                                        :disabled="!item.editable" size="sm" class="w-full"
                                        @update:model-value="(v) => setEditValue(item, v)" />

                                    <!-- Multi-value display -->
                                    <div v-else-if="Array.isArray(item.value)" class="flex items-center gap-1">
                                        <UBadge v-for="(v, i) in (getEditValue(item) as unknown[]).slice(0, 3)" :key="i"
                                            color="neutral" variant="soft" size="xs">
                                            {{ v }}
                                        </UBadge>
                                        <UBadge v-if="(getEditValue(item) as unknown[]).length > 3" color="neutral"
                                            variant="soft" size="xs">
                                            +{{ (getEditValue(item) as unknown[]).length - 3 }}
                                        </UBadge>
                                        <UButton v-if="item.editable" size="xs" variant="ghost" :icon="icons.edit"
                                            @click="openMultiValueEditor(item)" />
                                    </div>

                                    <!-- Text value -->
                                    <UInput v-else :model-value="String(getEditValue(item) ?? '')"
                                        :disabled="!item.editable" size="sm" class="w-full font-mono text-xs"
                                        @update:model-value="(v) => setEditValue(item, v)" />
                                </div>
                            </div>
                        </div>

                        <!-- Empty state for filtered category -->
                        <div v-if="filterCategoryItems(category.items).length === 0"
                            class="p-4 text-center text-sm text-[var(--color-text-muted)]">
                            {{ $t('noMatchingItems') }}
                        </div>
                    </div>
                </Transition>
            </div>
        </div>

        <!-- Multi-value Editor Modal -->
        <UModal v-model:open="showMultiValueModal">
            <template #content>
                <div class="p-4 space-y-4">
                    <h3 class="text-lg font-semibold">{{ editingItem?.configId }}</h3>
                    <p class="text-sm text-[var(--color-text-muted)]">{{ editingItem?.description }}</p>

                    <div class="space-y-2">
                        <div v-for="(val, idx) in multiValueList" :key="idx" class="flex items-center gap-2">
                            <UInput v-model="multiValueList[idx]" size="sm" class="flex-1" />
                            <UButton size="xs" variant="ghost" color="error" :icon="icons.delete"
                                @click="removeMultiValue(idx)" />
                        </div>
                    </div>

                    <UButton size="sm" variant="outline" :icon="icons.add" @click="addMultiValue">
                        {{ $t('addValue') }}
                    </UButton>

                    <div class="flex justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
                        <UButton variant="outline" color="neutral" @click="showMultiValueModal = false">
                            {{ $t('cancel') }}
                        </UButton>
                        <UButton color="primary" @click="saveMultiValue">
                            {{ $t('apply') }}
                        </UButton>
                    </div>
                </div>
            </template>
        </UModal>
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const { callApi, apiPost } = useApiHelpers()
const route = useRoute()

interface ConfigItem {
    configId: string
    description?: string
    type: string
    value: unknown
    possibleValues?: unknown[]
    multiValue?: boolean
    editable?: boolean
}

interface Category {
    name: string
    items: ConfigItem[]
}

const serverId = computed(() => route.params.id as string || null)
const search = ref('')
const loading = ref(false)
const saving = ref(false)
const serverConfigs = ref<Record<string, ConfigItem[]>>({})
const pendingChanges = ref<Map<string, unknown>>(new Map())
const expandedCategories = ref<Set<string>>(new Set())

// Multi-value editor state
const showMultiValueModal = ref(false)
const editingItem = ref<ConfigItem | null>(null)
const multiValueList = ref<string[]>([])

// Computed categories
const categories = computed<Category[]>(() => {
    return Object.entries(serverConfigs.value).map(([name, items]) => ({
        name,
        items: items || []
    }))
})

const filteredCategories = computed(() => {
    if (!search.value) return categories.value
    const q = search.value.toLowerCase()
    return categories.value
        .map(cat => ({
            ...cat,
            items: cat.items.filter(item =>
                item.configId.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q)
            )
        }))
        .filter(cat => cat.items.length > 0)
})

const categoryCount = computed(() => categories.value.length)
const itemCount = computed(() => categories.value.reduce((sum, cat) => sum + cat.items.length, 0))
const hasChanges = computed(() => pendingChanges.value.size > 0)
const changeCount = computed(() => pendingChanges.value.size)

// Filter items within a category
function filterCategoryItems(items: ConfigItem[]) {
    if (!search.value) return items
    const q = search.value.toLowerCase()
    return items.filter(item =>
        item.configId.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    )
}

// Category expansion
function toggleCategory(name: string) {
    if (expandedCategories.value.has(name)) {
        expandedCategories.value.delete(name)
    } else {
        expandedCategories.value.add(name)
    }
}

// Change tracking
function getEditValue(item: ConfigItem): unknown {
    return pendingChanges.value.has(item.configId)
        ? pendingChanges.value.get(item.configId)
        : item.value
}

function setEditValue(item: ConfigItem, value: unknown) {
    if (!item.editable) return
    if (JSON.stringify(value) === JSON.stringify(item.value)) {
        pendingChanges.value.delete(item.configId)
    } else {
        pendingChanges.value.set(item.configId, value)
    }
}

function hasItemChanged(configId: string): boolean {
    return pendingChanges.value.has(configId)
}

function getCategoryChangeCount(categoryName: string): number {
    const cat = categories.value.find(c => c.name === categoryName)
    if (!cat) return 0
    return cat.items.filter(item => pendingChanges.value.has(item.configId)).length
}

// Multi-value editor
function openMultiValueEditor(item: ConfigItem) {
    editingItem.value = item
    const currentValue = getEditValue(item)
    multiValueList.value = Array.isArray(currentValue)
        ? currentValue.map(v => String(v))
        : [String(currentValue)]
    showMultiValueModal.value = true
}

function addMultiValue() {
    multiValueList.value.push('')
}

function removeMultiValue(idx: number) {
    multiValueList.value.splice(idx, 1)
}

function saveMultiValue() {
    if (editingItem.value) {
        setEditValue(editingItem.value, multiValueList.value.filter(v => v.trim()))
    }
    showMultiValueModal.value = false
    editingItem.value = null
}

// API operations
async function fetchConfigs() {
    loading.value = true
    try {
        const data = await callApi<Record<string, ConfigItem[]>>('/opsidata/config/server')
        if (data) {
            serverConfigs.value = data
            // Expand first category by default
            const firstCat = categories.value[0]
            if (firstCat) {
                expandedCategories.value.add(firstCat.name)
            }
        }
    } catch (error) {
        console.error('Failed to fetch server configs:', error)
    } finally {
        loading.value = false
    }
}

async function saveAllChanges() {
    if (!hasChanges.value) return
    saving.value = true

    try {
        // Prepare changes for API
        const changes = Array.from(pendingChanges.value.entries()).map(([configId, value]) => ({
            configId,
            value: Array.isArray(value) ? value : [value]
        }))

        // API call to save configs
        const response = await apiPost('/opsidata/config/values', changes)
        if (response.error) {
            throw response.error
        }

        // Update local state with saved values
        pendingChanges.value.forEach((value, configId) => {
            for (const cat of Object.values(serverConfigs.value)) {
                const item = cat.find(i => i.configId === configId)
                if (item) {
                    item.value = value
                    break
                }
            }
        })

        // Clear pending changes
        pendingChanges.value.clear()
    } catch (error) {
        console.error('Failed to save configs:', error)
    } finally {
        saving.value = false
    }
}

function discardChanges() {
    pendingChanges.value.clear()
}

onMounted(() => {
    fetchConfigs()
})
</script>

<style scoped>
.collapse-enter-active,
.collapse-leave-active {
    transition: all 0.2s ease;
    overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
    opacity: 0;
    max-height: 0;
}

.collapse-enter-to,
.collapse-leave-from {
    max-height: 2000px;
}
</style>
