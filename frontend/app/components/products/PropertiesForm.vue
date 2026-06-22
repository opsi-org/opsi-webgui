<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ProductsPropertiesForm - Form for editing product property values.
-->
<template>
	<div class="flex flex-col h-full min-h-0">
		<div v-if="loading" class="py-8 flex justify-center">
			<CoreAppLoadingSpinner />
		</div>

		<CoreAppEmptyState v-else-if="properties.length === 0" :icon="icons.config"
			:message="String($t('products.propertiesNone'))" />

		<template v-else>
			<div class="flex-1 overflow-auto min-h-0">
				<div class="space-y-0">
					<div v-for="prop in visibleProperties" :key="prop.propertyId"
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-4 py-2 px-2 rounded transition-colors"
						:class="changedPropertyIds.has(prop.propertyId) ? 'bg-(--color-changed-bg)' : 'hover:bg-(--color-surface-hover)'">

						<div class="min-w-0 md:w-2/5 flex items-center gap-1.5">
							<CoreAppTooltipTable :rows="getPropertyTooltipRows(prop)">
								<span class="text-sm break-all cursor-help" :class="{
									'italic': prop.anyClientDifferentFromDepot,
									'font-bold': prop.anyDepotDifferentFromDefault,
								}">
									{{ prop.propertyId }}
								</span>
							</CoreAppTooltipTable>
							<span v-if="changedPropertyIds.has(prop.propertyId)"
								class="inline-flex items-center text-(--color-changed-text)">
								<CoreAppIcon :name="icons.pencilSquare" class="w-3 h-3" />
							</span>
						</div>

						<div class="flex-1 flex items-center gap-2 min-w-0 w-full md:w-auto">
							<CoreAppPropertyFormItem :model-value="prop._value"
								:type="prop.type === 'BoolProductProperty' ? 'bool' : 'unicode'"
								:possible-values="prop.allValues || []" :multi-value="prop.multiValue"
								:editable="prop.editable" :password="isPasswordProperty(prop.propertyId)"
								:mixed="isMixedValue(prop)" :aria-label="prop.propertyId"
								@update:model-value="(v: unknown) => handlePropertyChange(prop, v as EditablePropertyValue)" />

							<CoreAppButton v-if="changedPropertyIds.has(prop.propertyId)" size="xs" variant="ghost"
								color="neutral" :icon="icons.x" :title="$t('common.discard')"
								@click="discardSingleProperty(prop.propertyId)" />
						</div>
					</div>
				</div>
				<div v-if="hasMore" ref="loadMoreSentinel" class="flex items-center justify-center py-3">
					<span class="text-xs text-(--color-text-muted) animate-pulse">{{ $t('common.loading') }}…</span>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import type { EditableProductProperty, EditablePropertyValue } from '~/types'

interface Props {
	properties: EditableProductProperty[]
	loading?: boolean
	externalFilter?: string
}

const props = withDefaults(defineProps<Props>(), {
	loading: false,
	externalFilter: '',
})

const emit = defineEmits<{
	'update:property': [propertyId: string, value: EditablePropertyValue]
	'discard:property': [propertyId: string]
}>()

const MIXED_MARKER = '___MIXED___'

const icons = useIcons()
const { t: $t } = useI18n()

const filteredProperties = computed(() => {
	const q = (props.externalFilter || '').trim().toLowerCase()
	if (!q) return props.properties
	return props.properties.filter(
		p => p.propertyId.toLowerCase().includes(q) ||
			(p.description || '').toLowerCase().includes(q)
	)
})

const RENDER_BATCH = 40
const renderLimit = ref(RENDER_BATCH)
const visibleProperties = computed(() => filteredProperties.value.slice(0, renderLimit.value))
const hasMore = computed(() => renderLimit.value < filteredProperties.value.length)
const loadMoreSentinel = ref<HTMLElement | null>(null)

watch(() => filteredProperties.value.length, () => { renderLimit.value = RENDER_BATCH })

useIntersectionObserver(loadMoreSentinel, ([entry]) => {
	if (entry?.isIntersecting && hasMore.value) {
		renderLimit.value = Math.min(renderLimit.value + RENDER_BATCH, filteredProperties.value.length)
	}
})

const changedPropertyIds = computed(() => {
	const ids = new Set<string>()
	for (const prop of props.properties) {
		if (JSON.stringify(prop._value) !== JSON.stringify(prop._originalValue)) {
			ids.add(prop.propertyId)
		}
	}
	return ids
})

function isMixedValue(prop: EditableProductProperty): boolean {
	return prop._value === MIXED_MARKER || prop._originalValue === MIXED_MARKER
}

function isPasswordProperty(propertyId: string): boolean {
	const id = propertyId.toLowerCase()
	return ['password', 'secret', 'passwd'].some(marker => id.includes(marker))
}

function getPropertyTooltipRows(prop: EditableProductProperty): Array<{ key: string; value: string }> {
	const rows: Array<{ key: string; value: string }> = []
	rows.push({ key: String($t('common.type')), value: `${prop.type === 'BoolProductProperty' ? 'Bool' : 'Text'}${prop.multiValue ? ' (multi)' : ''}${prop.editable ? ' (editable)' : ''}` })
	if (prop.description) rows.push({ key: String($t('common.description')), value: prop.description })
	if (prop.default && prop.default.length > 0) {
		rows.push({ key: String($t('common.default')), value: prop.default.join(', ') })
	}
	if (prop.allValues && prop.allValues.length > 0) {
		rows.push({ key: String($t('common.values')), value: prop.allValues.map(String).join(', ') })
	}
	if (prop.anyDepotDifferentFromDefault) rows.push({ key: String($t('common.note')), value: 'Depot ≠ Default (bold)' })
	if (prop.anyClientDifferentFromDepot) rows.push({ key: String($t('common.note')), value: 'Client ≠ Depot (italic)' })
	return rows
}

function handlePropertyChange(prop: EditableProductProperty, value: EditablePropertyValue) {
	emit('update:property', prop.propertyId, value)
}

function discardSingleProperty(propertyId: string) {
	emit('discard:property', propertyId)
}
</script>
