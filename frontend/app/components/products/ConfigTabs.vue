<template>
	<div
		:class="['flex flex-col bg-(--color-background) dark:bg-(--color-background-dark)', panelMode ? '' : 'h-full min-h-0']">
		<SharedTabsNav v-model="activeTab" :tabs="tabDefs" class="mb-3 shrink-0" />

		<div v-show="activeTab === 'properties'" :class="['flex flex-col', panelMode ? '' : 'min-h-0 flex-1']">
			<ProductsPropertiesForm :properties="editableProperties" :loading="loadingProps" :readonly="readonly"
				@update:property="setProperty" @discard:property="discardSingleProperty" />
		</div>

		<div v-show="activeTab === 'dependencies'" :class="['flex flex-col', panelMode ? '' : 'min-h-0 flex-1']">
			<ProductsDependenciesForm :dependencies="dependencies" :loading="loadingDeps" />
		</div>
	</div>
</template>

<script setup lang="ts">
import type {
	ProductDependency,
	ProductProperty,
	EditableProductProperty,
	EditablePropertyValue,
	ProductConfigTabsRef,
} from '~/types'

interface Props {
	productId: string | null
	readonly?: boolean
	tab?: string
	panelMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	productId: null,
	readonly: false,
	tab: 'properties',
	panelMode: false,
})

const emit = defineEmits<{
	saved: []
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const toast = useToast()
const selectionStore = useSelectionStore()
const { getProductProperties, saveProductProperties, getProductDependencies } = useApiHelpers()

const activeTab = ref(props.tab || 'properties')
watch(() => props.tab, (v) => { if (v) activeTab.value = v })

const loadingProps = ref(false)
const loadingDeps = ref(false)
const savingProps = ref(false)

const rawProperties = ref<Record<string, ProductProperty>>({})
const editableProperties = ref<EditableProductProperty[]>([])
const originalPropertyValues = ref(new Map<string, EditablePropertyValue>())
const dependencies = ref<ProductDependency[]>([])

const MIXED_MARKER = '___MIXED___'

const tabDefs = computed(() => [
	{
		label: `${$t('properties')}${editableProperties.value.length > 0 ? ` (${editableProperties.value.length})` : ''}`,
		value: 'properties',
	},
	{
		label: `${$t('dependencies')}${dependencies.value.length > 0 ? ` (${dependencies.value.length})` : ''}`,
		value: 'dependencies',
	},
])

const changedProperties = computed(() => {
	const changed = new Map<string, EditablePropertyValue>()
	for (const prop of editableProperties.value) {
		if (JSON.stringify(prop._value) !== JSON.stringify(prop._originalValue)) {
			changed.set(prop.propertyId, prop._value)
		}
	}
	return changed
})

const hasPropertyChanges = computed(() => changedProperties.value.size > 0)
const hasAnyChanges = computed(() => hasPropertyChanges.value)
const changedCount = computed(() => changedProperties.value.size)
const isSaving = computed(() => savingProps.value)

function fmtVal(v: unknown): string {
	if (v === null || v === undefined) return '-'
	if (Array.isArray(v)) return v.join(', ')
	return String(v)
}

function getInitialPropertyValue(prop: ProductProperty, selectedClients: string[], selectedServers: string[]): EditablePropertyValue {
	if (prop.clients && Object.keys(prop.clients).length > 0) {
		const clientValues = Object.values(prop.clients)
		if (clientValues.length > 0) {
			const first = clientValues[0] || []
			const allSame = clientValues.every(v => JSON.stringify(v) === JSON.stringify(first))
			if (!allSame) return MIXED_MARKER
			if (prop.multiValue) return first.map(String)
			if (prop.type === 'BoolProductProperty') return first[0] ?? false
			return String(first[0] ?? '')
		}
	}
	if (prop.depots && Object.keys(prop.depots).length > 0) {
		const depotValues = Object.values(prop.depots)
		if (depotValues.length > 0) {
			const first = depotValues[0] || []
			const allSame = depotValues.every(v => JSON.stringify(v) === JSON.stringify(first))
			if (!allSame) return MIXED_MARKER
			if (prop.multiValue) return first.map(String)
			if (prop.type === 'BoolProductProperty') return first[0] ?? false
			return String(first[0] ?? '')
		}
	}
	if (prop.default && prop.default.length > 0) {
		if (prop.multiValue) return prop.default.map(String)
		if (prop.type === 'BoolProductProperty') return prop.default[0] ?? false
		return String(prop.default[0] ?? '')
	}
	return prop.type === 'BoolProductProperty' ? false : ''
}

function setProperty(propertyId: string, value: EditablePropertyValue) {
	const prop = editableProperties.value.find(p => p.propertyId === propertyId)
	if (prop) {
		prop._value = value
	}
}

function discardSingleProperty(propertyId: string) {
	const prop = editableProperties.value.find(p => p.propertyId === propertyId)
	if (prop) {
		prop._value = JSON.parse(JSON.stringify(prop._originalValue))
	}
}

function getOriginalPropertyValue(propertyId: string): EditablePropertyValue | undefined {
	return originalPropertyValues.value.get(propertyId)
}

async function fetchProperties() {
	if (!props.productId) {
		editableProperties.value = []
		rawProperties.value = {}
		return
	}
	loadingProps.value = true
	try {
		await selectionStore.ensureServersSelected()
		const depots = selectionStore.selectedServers
		const clients = selectionStore.selectedClients

		const queryParams: Record<string, unknown> = {}
		if (depots.length) queryParams.selectedServers = `[${depots.join(',')}]`
		if (clients.length) queryParams.selectedClients = `[${clients.join(',')}]`

		const result = await getProductProperties(props.productId, {
			selectedServers: depots,
			selectedClients: clients.length > 0 ? clients : undefined,
		})

		if (result.error) {
			console.error('Failed to fetch product properties:', result.error)
			toast.add({ title: String($t('error')), description: String($t('message.failedToLoadProperties')), color: 'error' })
			editableProperties.value = []
			return
		}

		const propsData = result.data?.properties || {}
		rawProperties.value = propsData as Record<string, ProductProperty>
		originalPropertyValues.value.clear()

		editableProperties.value = Object.values(propsData).map((p: unknown) => {
			const prop = p as ProductProperty
			const initialValue = getInitialPropertyValue(prop, clients, depots)
			originalPropertyValues.value.set(prop.propertyId, JSON.parse(JSON.stringify(initialValue)))
			return {
				...prop,
				_value: JSON.parse(JSON.stringify(initialValue)),
				_originalValue: JSON.parse(JSON.stringify(initialValue)),
			} as EditableProductProperty
		}).sort((a, b) => a.propertyId.localeCompare(b.propertyId))
	} catch (e) {
		console.error('fetchProperties failed:', e)
		editableProperties.value = []
	} finally {
		loadingProps.value = false
	}
}

async function fetchDependencies() {
	if (!props.productId) {
		dependencies.value = []
		return
	}
	loadingDeps.value = true
	try {
		const clients = selectionStore.selectedClients
		const result = await getProductDependencies(props.productId, {
			selectedClients: clients.length > 0 ? clients : undefined,
		})

		if (result.error) {
			console.error('Failed to fetch product dependencies:', result.error)
			dependencies.value = []
			return
		}

		dependencies.value = (result.data?.dependencies || []) as ProductDependency[]
	} catch (e) {
		console.error('fetchDependencies failed:', e)
		dependencies.value = []
	} finally {
		loadingDeps.value = false
	}
}

async function saveAll() {
	if (!props.productId || !hasPropertyChanges.value) return
	savingProps.value = true
	try {
		const changedProps: Record<string, string | boolean | string[]> = {}
		for (const [propertyId, value] of changedProperties.value) {
			changedProps[propertyId] = value as string | boolean | string[]
		}

		const depots = selectionStore.selectedServers
		const clients = selectionStore.selectedClients

		const result = await saveProductProperties(props.productId, {
			depotIds: depots,
			clientIds: clients.length > 0 ? clients : undefined,
			properties: changedProps,
		})

		if (result.error) throw result.error

		for (const prop of editableProperties.value) {
			prop._originalValue = JSON.parse(JSON.stringify(prop._value))
			originalPropertyValues.value.set(prop.propertyId, JSON.parse(JSON.stringify(prop._value)))
		}

		toast.add({ title: String($t('success')), description: String($t('message.propertiesSaved')), color: 'success' })
		emit('saved')
	} catch (e) {
		console.error('Failed to save properties:', e)
		toast.add({
			title: String($t('error')),
			description: e instanceof Error ? e.message : String($t('message.failedToSaveProperties')),
			color: 'error',
		})
	} finally {
		savingProps.value = false
	}
}

function discardAll() {
	for (const prop of editableProperties.value) {
		prop._value = JSON.parse(JSON.stringify(prop._originalValue))
	}
}

async function refresh() {
	await Promise.all([fetchProperties(), fetchDependencies()])
}

watch(() => props.productId, async () => {
	activeTab.value = props.tab || 'properties'
	await refresh()
}, { immediate: true })

defineExpose<ProductConfigTabsRef>({
	hasAnyChanges: hasAnyChanges as unknown as boolean,
	isSaving: isSaving as unknown as boolean,
	changedCount: changedCount as unknown as number,
	changedProperties: changedProperties as unknown as Map<string, EditablePropertyValue>,
	changedActionRequests: new Map(),
	saveAll,
	discardAll,
	discardSingleProperty,
	discardSingleActionRequest: () => { },
	getOriginalPropertyValue,
	fmtVal,
	refresh,
})
</script>
