TabsNav - A reusable tabs navigation component.
<template>
    <div class="flex rounded-md overflow-hidden border border-(--color-border)">
        <button v-for="tab in tabs" :key="tab.value" @click="selectTab(tab.value)"
            class="px-3 py-1.5 text-sm font-medium transition-colors"
            :class="modelValue === tab.value
                ? 'bg-opsi-blue text-white'
                : 'bg-white dark:bg-(--color-surface) text-(--color-text) dark:text-(--color-text-muted) hover:bg-(--color-surface) dark:hover:bg-(--color-surface-hover)'">
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
