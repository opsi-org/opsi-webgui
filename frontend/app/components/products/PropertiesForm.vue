<template>
	<div class="flex flex-col h-full min-h-0">
		<div v-if="loading" class="py-8 flex justify-center">
			<UIcon :name="icons.loading" class="w-6 h-6 animate-spin text-opsi-blue" />
		</div>

		<div v-else-if="properties.length === 0" class="py-8 text-center text-sm text-(--color-text-muted)">
			<UIcon :name="icons.settings" class="w-10 h-10 mx-auto mb-2 opacity-40" />
			<p>{{ $t('noProperties') }}</p>
		</div>

		<template v-else>
			<div class="shrink-0 mb-3">
				<UInput v-model="search" :placeholder="$t('filterProperties')" :icon="icons.search" size="sm"
					class="w-full" />
			</div>

			<div class="flex-1 overflow-auto min-h-0">
				<div class="divide-y divide-(--color-border) dark:divide-(--color-border)">
					<div v-for="prop in filteredProperties" :key="prop.propertyId"
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-4 py-2.5 px-2 rounded transition-colors"
						:class="isPropertyChanged(prop.propertyId) ? 'bg-yellow-50 dark:bg-yellow-700/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'">
						<div class="min-w-0 md:w-2/5 flex items-start gap-2">
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-1.5 flex-wrap">
									<span class="font-mono text-sm break-all" :class="{
										'italic': prop.anyClientDifferentFromDepot,
										'font-bold': prop.anyDepotDifferentFromDefault,
									}">
										{{ prop.propertyId }}
									</span>
									<UBadge :color="prop.type === 'BoolProductProperty' ? 'info' : 'neutral'"
										variant="subtle" size="xs">
										{{ prop.type === 'BoolProductProperty' ? 'Bool' : 'Text' }}
									</UBadge>
									<UBadge v-if="prop.multiValue" color="secondary" variant="subtle" size="xs">
										Multi
									</UBadge>
									<span v-if="isPropertyChanged(prop.propertyId)"
										class="inline-flex items-center text-yellow-700 dark:text-yellow-200">
										<UIcon name="i-heroicons-pencil-square" class="w-3 h-3" />
									</span>
								</div>
								<p v-if="prop.description" class="text-xs text-(--color-text-muted) mt-0.5 line-clamp-2"
									:title="prop.description">
									{{ prop.description }}
								</p>
								<div v-if="prop.default && prop.default.length > 0"
									class="flex items-center gap-1 mt-1 text-xs text-(--color-text-muted)">
									<span>{{ $t('default') }}:</span>
									<UBadge v-for="val in prop.default.slice(0, 3)" :key="String(val)" color="neutral"
										variant="soft" size="xs">
										{{ String(val) }}
									</UBadge>
									<span v-if="prop.default.length > 3">+{{ prop.default.length - 3 }}</span>
								</div>
							</div>
						</div>

						<div class="flex-1 flex items-center gap-2 min-w-0 w-full md:w-auto">
							<template v-if="prop.type === 'BoolProductProperty'">
								<UCheckbox :model-value="getBoolValue(prop)" :indeterminate="isMixedValue(prop)"
									:disabled="readonly || !prop.editable"
									@update:model-value="(v: boolean | 'indeterminate') => handlePropertyChange(prop, v)" />
								<span v-if="isMixedValue(prop)" class="text-xs text-(--color-text-muted) italic">
									{{ $t('mixed') }}
								</span>
							</template>

							<template v-else-if="isPasswordProperty(prop.propertyId)">
								<SharedPasswordInput :model-value="getStringValue(prop)"
									:disabled="readonly || !prop.editable" size="sm" class="flex-1 font-mono"
									@update:model-value="(v: string) => handlePropertyChange(prop, v)" />
							</template>

							<template v-else-if="prop.multiValue">
								<USelectMenu :model-value="getMultiValue(prop)" :items="getAllValueOptions(prop)"
									multiple size="sm" class="flex-1" :disabled="readonly || !prop.editable"
									@update:model-value="(v: string[]) => handlePropertyChange(prop, v)" />
							</template>

							<template v-else-if="prop.allValues && prop.allValues.length > 0 && !prop.editable">
								<USelect :model-value="getStringValue(prop)" :items="getAllValueItems(prop)" size="sm"
									class="flex-1" :disabled="readonly"
									@update:model-value="(v: string) => handlePropertyChange(prop, v)" />
							</template>

							<template v-else-if="prop.allValues && prop.allValues.length > 0 && prop.editable">
								<USelectMenu :model-value="getStringValue(prop)" :items="getAllValueOptions(prop)"
									:creatable="true" size="sm" class="flex-1" :disabled="readonly"
									@update:model-value="(v: string | string[]) => handlePropertyChange(prop, Array.isArray(v) ? v[0] || '' : v)" />
							</template>

							<template v-else>
								<UInput :model-value="getStringValue(prop)" size="sm" class="flex-1"
									:disabled="readonly || !prop.editable"
									@update:model-value="(v: string) => handlePropertyChange(prop, v)" />
							</template>

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
	readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	loading: false,
	readonly: false,
})

const emit = defineEmits<{
	'update:property': [propertyId: string, value: EditablePropertyValue]
	'discard:property': [propertyId: string]
}>()

const MIXED_MARKER = '___MIXED___'

const icons = useIcons()
const { t: $t } = useI18n()
const search = ref('')

const filteredProperties = computed(() => {
	const q = search.value.trim().toLowerCase()
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

function getBoolValue(prop: EditableProductProperty): boolean {
	if (isMixedValue(prop)) return false
	if (typeof prop._value === 'boolean') return prop._value
	if (typeof prop._value === 'string') return prop._value === 'true' || prop._value === '1'
	if (Array.isArray(prop._value)) return prop._value[0] === 'true' || prop._value[0] === '1' || prop._value[0] === true as unknown as string
	return false
}

function getStringValue(prop: EditableProductProperty): string {
	if (isMixedValue(prop)) return String($t('mixed'))
	if (typeof prop._value === 'string') return prop._value
	if (typeof prop._value === 'boolean') return String(prop._value)
	if (Array.isArray(prop._value)) return prop._value[0] || ''
	return ''
}

function getMultiValue(prop: EditableProductProperty): string[] {
	if (Array.isArray(prop._value)) return prop._value.map(String)
	if (typeof prop._value === 'string' && prop._value) return [prop._value]
	return []
}

function getAllValueOptions(prop: EditableProductProperty): string[] {
	const values = (prop.allValues || []).map(String)
	return [...new Set(values)]
}

function getAllValueItems(prop: EditableProductProperty): Array<{ label: string; value: string }> {
	return getAllValueOptions(prop).map(v => ({ label: v, value: v }))
}

function isPasswordProperty(propertyId: string): boolean {
	return ['password', 'secret'].some(marker => propertyId.toLowerCase().includes(marker))
}

function handlePropertyChange(prop: EditableProductProperty, value: EditablePropertyValue) {
	emit('update:property', prop.propertyId, value)
}

function discardSingleProperty(propertyId: string) {
	emit('discard:property', propertyId)
}
</script>
