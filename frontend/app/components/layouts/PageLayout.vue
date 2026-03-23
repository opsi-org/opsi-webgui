PageLayout - A layout component with a fixed header (for controls) and a scrollable content area.
<template>
	<div
		class="page-layout flex flex-col h-full min-h-0 overflow-hidden bg-(--color-background) dark:bg-(--color-background-dark)">
		<div class="page-header shrink-0 bg-(--color-background) dark:bg-(--color-background-dark) pb-3">
			<div v-if="showControlsRow" class="flex flex-wrap items-center justify-between gap-3">
				<div class="flex items-center gap-2">
					<slot name="tabs" />
					<slot name="filters" />
				</div>
				<div class="flex flex-wrap items-center gap-2">
					<UInput v-if="showSearch" v-model="searchModel"
						:placeholder="searchPlaceholder || $t('typeToFilter')" :icon="icons.filter" size="sm"
						class="w-full sm:w-48 md:w-64" />
					<slot name="tableControls" />
					<slot name="actions" />
					<NuxtLink v-if="addLink" :to="addLink">
						<UButton :icon="icons.add" color="primary" size="sm">
							<span class="hidden sm:inline">{{ addLabel || $t('addNew') }}</span>
						</UButton>
					</NuxtLink>
					<slot name="saveActions" />
					<UTooltip :text="$t('refresh')">
						<UButton v-if="showRefresh" :icon="icons.refresh" color="neutral" variant="ghost" size="sm"
							:loading="loading" @click="$emit('refresh')" />
					</UTooltip>
				</div>
			</div>

			<div v-if="$slots.stats" class="mt-3 pt-3 border-t border-(--color-border)">
				<slot name="stats" />
			</div>
		</div>

		<div class="page-content flex-1 min-h-0 overflow-auto">
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	showSearch?: boolean
	searchPlaceholder?: string
	addLink?: string
	addLabel?: string
	showRefresh?: boolean
	loading?: boolean
	modelValue?: string
}>()

const emit = defineEmits<{
	'update:modelValue': [value: string]
	refresh: []
}>()

const icons = useIcons()
const { t: $t } = useI18n()

const showControlsRow = computed(() =>
	props.showSearch || props.showRefresh || props.addLink ||
	!!useSlots().tabs || !!useSlots().filters || !!useSlots().actions || !!useSlots().tableControls
)

const searchModel = computed({
	get: () => props.modelValue || '',
	set: (value: string) => emit('update:modelValue', value)
})
</script>

<style scoped>
.page-layout {
	max-height: 100%;
}
</style>
