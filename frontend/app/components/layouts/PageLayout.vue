<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  LayoutsPageLayout - Standard page layout with optional split-view detail panel.
-->
<template>
	<div class="page-layout flex flex-col h-full min-h-0 min-w-0 overflow-hidden" ref="containerRef">
		<div class="page-header shrink-0 pb-3">
			<div v-if="showControlsRow" class="flex flex-wrap items-center justify-between gap-3">
				<div class="flex items-center gap-2">
					<slot name="tabs" />
					<slot name="filters" />
				</div>
				<div class="flex flex-wrap items-center gap-2">
					<CoreAppFilterInput v-if="showFilter" v-model="searchModel"
						:placeholder="searchPlaceholder || $t('common.filter')" size="sm" />
					<slot name="tableControls" />
					<slot name="actions" />
					<slot name="saveActions" />
					<CoreAppButton v-if="showRefresh" :icon="icons.refresh" color="primary" variant="outline" size="sm"
						:loading="loading" :title="String($t('common.refresh'))" @click="$emit('refresh')" />
				</div>
			</div>

			<div v-if="$slots.stats" class="mt-3 pt-3 border-t border-(--color-border)">
				<slot name="stats" />
			</div>
		</div>

		<div class="page-body flex-1 min-h-0 relative" :class="showPanel && !useOverlayPanel ? 'flex' : ''">
			<div :style="mainStyle" class="min-h-0 overflow-y-auto transition-[width] duration-200 min-w-0"
				:tabindex="allowXScroll ? 0 : undefined"
				:class="[showPanel && !useOverlayPanel ? '' : 'h-full', allowXScroll ? 'overflow-x-auto' : 'overflow-x-hidden']">
				<slot />
			</div>

			<Transition :name="useOverlayPanel ? 'slide-up' : 'slide-in'">
				<div v-if="showPanel" :style="panelStyle" :class="panelClasses" data-testid="detail-panel">
					<!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- pointer-only drag resize handle; not keyboard operable by design -->
					<div v-if="!useOverlayPanel" @mousedown="startResize"
						class="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize bg-transparent hover:bg-opsi-blue/30 active:bg-opsi-blue/50 transition-colors z-10 group">
						<div
							class="absolute left-0.5 top-1/2 -translate-y-1/2 w-0.5 h-12 bg-(--color-border) rounded group-hover:bg-opsi-blue transition-colors" />
					</div>
					<div class="shrink-0 border-t border-b border-(--color-border) px-4 py-3 bg-(--color-surface)">
						<div class="flex items-center gap-3">
							<CoreAppButton v-if="useOverlayPanel" @click="$emit('close-panel')" variant="ghost"
								color="neutral" size="xs" :aria-label="String($t('common.back'))"
								:title="String($t('common.back'))">
								<CoreAppIcon :name="icons.chevronLeft" class="w-3 h-3" />
							</CoreAppButton>
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-x-1 min-w-0">
									<span class="font-semibold truncate m-0">
										<slot name="panel-title">Details</slot>
									</span>
									<span v-if="$slots['panel-subtitle']"
										class="text-sm text-(--color-text-muted) truncate">
										<slot name="panel-subtitle" />
									</span>
								</div>
							</div>
							<div class="flex items-center gap-1 shrink-0">
								<slot name="panel-actions" />
								<CoreAppButton @click="$emit('close-panel')" variant="ghost" color="neutral" size="xs"
									:aria-label="String($t('common.close'))" :title="String($t('common.close'))">
									<CoreAppIcon :name="icons.x" class="w-3 h-3" />
								</CoreAppButton>
							</div>
						</div>
					</div>
					<div tabindex="0" data-testid="detail-panel-content"
						class="flex-1 overflow-y-auto overflow-x-auto p-3 bg-(--color-surface) min-h-0 min-w-0 max-w-full">
						<slot name="panel" />
					</div>
				</div>
			</Transition>
		</div>
	</div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
	showFilter?: boolean
	searchPlaceholder?: string
	showRefresh?: boolean
	loading?: boolean
	modelValue?: string
	showPanel?: boolean
	defaultPanelWidthPercent?: number
	allowXScroll?: boolean
}>(), {
	defaultPanelWidthPercent: 50,
})

const emit = defineEmits<{
	'update:modelValue': [value: string]
	refresh: []
	'close-panel': []
}>()

const icons = useIcons()
const { t: $t } = useI18n()

const showControlsRow = computed(() =>
	props.showFilter || props.showRefresh ||
	!!useSlots().tabs || !!useSlots().filters || !!useSlots().actions || !!useSlots().tableControls || !!useSlots().saveActions
)

const searchModel = computed({
	get: () => props.modelValue || '',
	set: (value: string) => emit('update:modelValue', value)
})

// Split view state
const isMobile = ref(false)
const isSplitPanelNarrow = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const panelWidthPercent = ref(props.defaultPanelWidthPercent)
const minPanelPercent = 25
const maxPanelPercent = 75
const narrowSplitMinWidth = 1180

onMounted(() => {
	const updateLayoutMode = () => {
		const containerWidth = containerRef.value?.clientWidth || window.innerWidth
		isMobile.value = window.innerWidth < 768
		isSplitPanelNarrow.value = containerWidth < narrowSplitMinWidth
	}
	updateLayoutMode()
	window.addEventListener('resize', updateLayoutMode)
	onUnmounted(() => window.removeEventListener('resize', updateLayoutMode))
})

const useOverlayPanel = computed(() => isMobile.value || (props.showPanel && isSplitPanelNarrow.value))

const mainStyle = computed(() => {
	if (!props.showPanel || useOverlayPanel.value) return { width: '100%' }
	return { width: `${100 - panelWidthPercent.value}%` }
})

const panelStyle = computed(() => {
	if (useOverlayPanel.value) return {}
	return { width: `${panelWidthPercent.value}%` }
})

const panelClasses = computed(() => {
	if (useOverlayPanel.value) {
		return 'absolute inset-0 z-50 bg-(--color-surface-elevated) flex flex-col'
	}
	return 'absolute right-0 top-0 bottom-0 bg-(--color-surface-elevated) border-l border-(--color-border) flex flex-col shadow-lg'
})

function startResize(e: MouseEvent) {
	e.preventDefault()
	const startX = e.clientX
	const containerWidth = containerRef.value?.clientWidth || window.innerWidth
	const startPercent = panelWidthPercent.value

	const onMove = (ev: MouseEvent) => {
		const delta = startX - ev.clientX
		const deltaPercent = (delta / containerWidth) * 100
		panelWidthPercent.value = Math.round(Math.min(maxPanelPercent, Math.max(minPanelPercent, startPercent + deltaPercent)))
	}

	const onUp = () => {
		document.removeEventListener('mousemove', onMove)
		document.removeEventListener('mouseup', onUp)
	}

	document.addEventListener('mousemove', onMove)
	document.addEventListener('mouseup', onUp)
}
</script>

<style scoped>
.page-layout {
	max-height: 100%;
}

.slide-in-enter-active,
.slide-in-leave-active {
	transition: transform 0.2s ease, opacity 0.2s ease;
}

.slide-in-enter-from,
.slide-in-leave-to {
	transform: translateX(100%);
	opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
	transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
	transform: translateY(100%);
}
</style>
