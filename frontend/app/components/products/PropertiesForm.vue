<template>
	<div class="flex flex-col h-full min-h-0">
		<div v-if="loading" class="py-8 flex justify-center">
			<UIcon :name="icons.loading" class="w-6 h-6 animate-spin text-opsi-blue" />
		</div>

		<div v-else-if="properties.length === 0" class="py-8 text-center text-sm text-(--color-text-muted)">
			<UIcon :name="icons.config" class="w-10 h-10 mx-auto mb-2 opacity-40" />
			<p>{{ $t('noProperties') }}</p>
		</div>

		<template v-else>
			<div class="flex-1 overflow-auto min-h-0">
				<div class="space-y-0">
					<div v-for="prop in filteredProperties" :key="prop.propertyId"
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-4 py-2 px-2 rounded transition-colors"
						:class="isPropertyChanged(prop.propertyId) ? 'bg-yellow-50 dark:bg-yellow-700/10' : 'hover:bg-(--color-surface-hover)'">

						<div class="min-w-0 md:w-2/5 flex items-center gap-1.5">
							<SharedTooltipTable :rows="getPropertyTooltipRows(prop)">
								<span class="font-mono text-sm break-all cursor-help" :class="{
									'italic': prop.anyClientDifferentFromDepot,
									'font-bold': prop.anyDepotDifferentFromDefault,
								}">
									{{ prop.propertyId }}
								</span>
							</SharedTooltipTable>
							<span v-if="isPropertyChanged(prop.propertyId)"
								class="inline-flex items-center text-yellow-700 dark:text-yellow-200">
								<UIcon name="i-heroicons-pencil-square" class="w-3 h-3" />
							</span>
						</div>

						<div class="flex-1 flex items-center gap-2 min-w-0 w-full md:w-auto">
							<SharedPropertyFormItem :model-value="prop._value"
								:type="prop.type === 'BoolProductProperty' ? 'bool' : 'unicode'"
								:possible-values="prop.allValues || []" :multi-value="prop.multiValue"
								:editable="prop.editable" :password="isPasswordProperty(prop.propertyId)"
								:mixed="isMixedValue(prop)"
								@update:model-value="(v: unknown) => handlePropertyChange(prop, v as EditablePropertyValue)" />

							<UButton v-if="isPropertyChanged(prop.propertyId)" size="xs" variant="ghost" color="neutral"
								:icon="icons.close" :title="$t('discardItem')"
								@click="discardSingleProperty(prop.propertyId)" />
						</div>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
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

function isPropertyChanged(propertyId: string): boolean {
	const prop = props.properties.find(p => p.propertyId === propertyId)
	if (!prop) return false
	return JSON.stringify(prop._value) !== JSON.stringify(prop._originalValue)
}

function isMixedValue(prop: EditableProductProperty): boolean {
	return prop._value === MIXED_MARKER || prop._originalValue === MIXED_MARKER
}

function isPasswordProperty(propertyId: string): boolean {
	const id = propertyId.toLowerCase()
	return ['password', 'secret', 'passwd'].some(marker => id.includes(marker))
}

function getPropertyTooltipRows(prop: EditableProductProperty): Array<{ key: string; value: string }> {
	const rows: Array<{ key: string; value: string }> = []
	rows.push({ key: String($t('type')), value: `${prop.type === 'BoolProductProperty' ? 'Bool' : 'Text'}${prop.multiValue ? ' (multi)' : ''}${prop.editable ? ' (editable)' : ''}` })
	if (prop.description) rows.push({ key: String($t('description')), value: prop.description })
	if (prop.default && prop.default.length > 0) {
		rows.push({ key: String($t('default')), value: prop.default.join(', ') })
	}
	if (prop.allValues && prop.allValues.length > 0) {
		rows.push({ key: String($t('values')), value: prop.allValues.map(String).join(', ') })
	}
	if (prop.anyDepotDifferentFromDefault) rows.push({ key: String($t('note')), value: 'Depot ≠ Default (bold)' })
	if (prop.anyClientDifferentFromDepot) rows.push({ key: String($t('note')), value: 'Client ≠ Depot (italic)' })
	return rows
}

function handlePropertyChange(prop: EditableProductProperty, value: EditablePropertyValue) {
	emit('update:property', prop.propertyId, value)
}

function discardSingleProperty(propertyId: string) {
	emit('discard:property', propertyId)
}
</script>
