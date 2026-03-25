HostsConfigTabs - Parameters and Attributes tabs with optional page layout.
<template>
	<UModal v-if="showHostSelector || !panelMode" v-model:open="showLeaveWarning" :title="$t('unsavedChanges')">
		<template #body>
			<p class="text-sm">{{ $t('navigateAwayWarning') }}</p>
		</template>
		<template #footer>
			<div class="flex gap-2 justify-end">
				<UButton variant="outline" color="neutral" @click="cancelLeave">{{ $t('stayOnPage') }}</UButton>
				<UButton color="error" @click="confirmLeave">{{ $t('leaveAnyway') }}</UButton>
			</div>
		</template>
	</UModal>

	<!-- Create Config Modal -->
	<UModal v-model:open="showCreateConfigModal" :title="$t('createConfig')">
		<template #body>
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium mb-1">{{ $t('configId') }} *</label>
					<UInput v-model="newConfig.configId" :placeholder="'e.g. category.subcategory.name'" size="sm" />
				</div>
				<div>
					<label class="block text-sm font-medium mb-1">{{ $t('description') }}</label>
					<UInput v-model="newConfig.description" size="sm" />
				</div>
				<div>
					<label class="block text-sm font-medium mb-1">{{ $t('type') }}</label>
					<USelect v-model="newConfig.type" :items="configTypeOptions" size="sm" />
				</div>
				<div class="flex items-center gap-4">
					<label class="flex items-center gap-2 text-sm">
						<UCheckbox v-model="newConfig.multiValue" size="sm" />
						{{ $t('multiValue') }}
					</label>
					<label class="flex items-center gap-2 text-sm">
						<UCheckbox v-model="newConfig.editable" size="sm" />
						{{ $t('editable') }}
					</label>
				</div>
				<div v-if="newConfig.type === 'UnicodeConfig'">
					<label class="block text-sm font-medium mb-1">{{ $t('possibleValues') }}</label>
					<div v-if="newConfig.possibleValues.length > 0" class="flex flex-wrap gap-1 mb-1">
						<span v-for="(val, idx) in newConfig.possibleValues" :key="idx"
							class="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-(--color-primary) border border-primary/20">
							{{ val }}
							<button type="button" class="hover:text-red-500 transition-colors"
								@click="newConfig.possibleValues.splice(idx, 1)">
								<UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
							</button>
						</span>
					</div>
					<div class="flex gap-1">
						<UInput v-model="newPossibleValue" :placeholder="$t('pressEnterToAdd')" size="sm" class="flex-1"
							@keydown.enter.prevent="addPossibleValue" />
						<UButton size="sm" variant="soft" color="neutral" :icon="icons.add" @click="addPossibleValue" />
					</div>
				</div>
				<div v-if="newConfig.type === 'UnicodeConfig'">
					<label class="block text-sm font-medium mb-1">{{ $t('defaultValues') }}</label>
					<div v-if="newConfig.defaultValues.length > 0" class="flex flex-wrap gap-1 mb-1">
						<span v-for="(val, idx) in newConfig.defaultValues" :key="idx"
							class="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-(--color-primary) border border-primary/20">
							{{ val }}
							<button type="button" class="hover:text-red-500 transition-colors"
								@click="newConfig.defaultValues.splice(idx, 1)">
								<UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
							</button>
						</span>
					</div>
					<div class="flex gap-1">
						<UInput v-model="newDefaultValue" :placeholder="$t('pressEnterToAdd')" size="sm" class="flex-1"
							@keydown.enter.prevent="addDefaultValue" />
						<UButton size="sm" variant="soft" color="neutral" :icon="icons.add" @click="addDefaultValue" />
					</div>
				</div>
				<div v-if="newConfig.type === 'BoolConfig'">
					<label class="block text-sm font-medium mb-1">{{ $t('defaultValues') }}</label>
					<USelect v-model="newConfig.boolDefault"
						:items="[{ label: 'true', value: 'true' }, { label: 'false', value: 'false' }]" size="sm" />
				</div>
				<UAlert v-if="createConfigError" color="error" :title="$t('error')" :description="createConfigError"
					variant="subtle" />
			</div>
		</template>
		<template #footer>
			<div class="flex gap-2 justify-end">
				<UButton variant="outline" color="neutral" @click="resetCreateConfigModal">{{ $t('cancel') }}</UButton>
				<UButton color="primary" :loading="creatingConfig" :disabled="!newConfig.configId.trim()"
					@click="handleCreateConfig">{{ $t('create') }}</UButton>
			</div>
		</template>
	</UModal>

	<div
		:class="['flex flex-col bg-(--color-background) dark:bg-(--color-background-dark)', panelMode ? '' : 'h-full min-h-0']">

		<div class="shrink-0 pb-3">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div class="flex items-center gap-2">
					<SharedTabsNav v-model="activeTab" :tabs="tabDefs" />
					<template v-if="showHostSelector">
						<span class="h-5 w-px bg-(--color-border) mx-1" />
						<slot name="hostSelector">
							<HostsSelector v-model="hostSelectorModel" :type="hostType"
								:placeholder="hostSelectorPlaceholder" allow-clear />
						</slot>
					</template>
				</div>
				<div class="flex flex-wrap items-center gap-2">
					<UInput v-model="paramSearch" :placeholder="String($t('typeToFilter'))" size="sm"
						class="w-full sm:w-32 md:w-40" icon="i-lucide-search" />
					<UTooltip v-if="isServerDefaultMode" :text="$t('createConfig')">
						<UButton :icon="icons.add" color="primary" variant="soft" size="sm"
							@click="showCreateConfigModal = true">
							<span class="hidden sm:inline">{{ $t('createConfig') }}</span>
						</UButton>
					</UTooltip>
					<SharedUnsavedChangesModal v-if="showUnsavedModal" :config-ref="unsavedChangesRef" size="sm"
						@save-all="saveAll" @discard-all="discardAll" />
					<UTooltip :text="$t('refresh')">
						<UButton :icon="icons.refresh" color="neutral" variant="ghost" size="sm"
							:loading="loadingParams || loadingAttrs" @click="refresh" />
					</UTooltip>
				</div>
			</div>
		</div>

		<div v-show="activeTab === 'parameters'" :class="['flex flex-col', panelMode ? '' : 'min-h-0 h-full']">
			<div v-if="loadingParams" class="py-8 flex justify-center">
				<UIcon :name="icons.loading" class="w-6 h-6 animate-spin text-opsi-blue" />
			</div>
			<div v-else-if="Object.keys(groupedFilteredParams).length === 0"
				class="py-8 text-center text-sm text-muted">
				<UIcon :name="icons.config" class="w-10 h-10 mx-auto mb-2 opacity-40" />
				<p>{{ (hostId || hostType === 'server') ? $t('noParametersFound') : $t('selectHostFirst') }}</p>
			</div>
			<HostsParametersTreeForm :params="filteredFlatParams" :changed-params="changedParams" :readonly="readonly"
				:current-value="currentValue" :set-param="setParam" :discard-single-param="discardSingleParam"
				:icons="icons" :fmt-val="fmtVal" :auto-open-all="!!paramSearch" />
		</div>

		<div v-show="activeTab === 'attributes'" :class="['flex flex-col', panelMode ? '' : 'min-h-0 h-full']">
			<div v-if="loadingAttrs" class="py-8 flex justify-center">
				<UIcon :name="icons.loading" class="w-6 h-6 animate-spin text-opsi-blue" />
			</div>
			<div v-else-if="!hostId" class="py-8 text-center text-sm text-muted">
				<UIcon :name="icons.config" class="w-10 h-10 mx-auto mb-2 opacity-40" />
				<p>{{ $t('selectHostFirst') }}</p>
			</div>
			<div v-if="filteredReadonlyAttrKeys.length"
				class="mb-6 border-b border-(--color-border) dark:border-(--color-border)">
				<div v-for="key in filteredReadonlyAttrKeys" :key="key"
					class="orm-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
					<span
						class="text-sm text-(--color-text-secondary) dark:text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
						{{ getAttributeLabel(key) }}
					</span>
					<span class="text-sm font-mono flex-1 truncate" :title="fmtVal(originalAttributes[key])">
						{{ fmtVal(originalAttributes[key]) }}
					</span>
				</div>
			</div>

			<div v-if="filteredEditableAttrKeys.length" class="mb-6">
				<div v-for="key in filteredEditableAttrKeys" :key="key"
					class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
					:class="isAttrChanged(key) ? 'bg-yellow-50 dark:bg-yellow-700/10' : ''">
					<span
						class="font-mono text-sm text-(--color-text-secondary) dark:text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
						{{ getAttributeLabel(key) }}
						<span v-if="isAttrChanged(key)"
							class="inline-flex items-center text-[10px] text-yellow-700 dark:text-yellow-200">
							<UIcon name="i-heroicons-pencil-square" class="w-3 h-3" />
						</span>
					</span>
					<div class="flex-1 flex items-center gap-2 min-w-0">
						<UCheckbox v-if="typeof originalAttributes[key] === 'boolean'"
							v-model="(editableAttributes as Record<string, boolean>)[key]" :disabled="readonly" />
						<UCheckbox v-else-if="key === 'isMasterDepot'"
							:model-value="editableAttributes[key] === true || editableAttributes[key] === 'true'"
							:disabled="readonly"
							@update:model-value="(v: boolean | 'indeterminate') => { editableAttributes[key] = v }" />
						<SharedPasswordInput v-else-if="isPasswordAttribute(key)"
							v-model="(editableAttributes as Record<string, string>)[key]" size="sm" :disabled="readonly"
							class="flex-1 font-mono" />
						<UInput v-else v-model="(editableAttributes as Record<string, string>)[key]" size="sm"
							:disabled="readonly" class="flex-1" />
						<UButton v-if="isAttrChanged(key)" size="xs" variant="ghost" color="neutral" :icon="icons.close"
							:title="$t('discardItem')" @click="discardSingleAttribute(key)" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
interface Param {
	configId: string
	type: 'BoolConfig' | 'UnicodeConfig'
	description?: string
	defaultValues: unknown[]
	possibleValues: unknown[]
	multiValue: boolean
	editable: boolean
	objects: Record<string, unknown>
}

interface Props {
	hostId?: string | null
	hostType?: 'client' | 'server'
	readonly?: boolean
	tab?: string
	showTabs?: boolean
	search?: string
	panelMode?: boolean
	showChangeBanner?: boolean
	showHostSelector?: boolean
	hostSelectorPlaceholder?: string
}

const props = withDefaults(defineProps<Props>(), {
	hostId: null,
	hostType: 'client',
	readonly: false,
	tab: '',
	showTabs: true,
	search: undefined,
	panelMode: false,
	showChangeBanner: true,
	showHostSelector: false,
	hostSelectorPlaceholder: undefined,
})

const emit = defineEmits<{
	saved: []
	'attribute-change': [hasChanges: boolean]
	'update:search': [value: string]
	'update:hostId': [value: string | null]
	'update:tab': [value: string]
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const {
	getHostConfigObjects,
	saveHostConfigState,
	saveServerConfigValues,
	getHostAttributes,
	getServerAttributes,
	updateClientAttributes,
	updateServerAttributes,
	getServerDefaultConfig,
	createConfig,
} = useApiHelpers()

const isServerDefaultMode = computed(() => props.hostType === 'server' && !props.hostId)

// Create Config modal state
const showCreateConfigModal = ref(false)
const creatingConfig = ref(false)
const createConfigError = ref<string | null>(null)
const newPossibleValue = ref('')
const newDefaultValue = ref('')
const configTypeOptions = [
	{ label: 'Unicode', value: 'UnicodeConfig' },
	{ label: 'Bool', value: 'BoolConfig' },
]
const newConfig = reactive({
	configId: '',
	description: '',
	type: 'UnicodeConfig' as 'UnicodeConfig' | 'BoolConfig',
	multiValue: false,
	editable: true,
	possibleValues: [] as string[],
	defaultValues: [] as string[],
	boolDefault: 'false',
})

function addPossibleValue() {
	const v = newPossibleValue.value.trim()
	if (v && !newConfig.possibleValues.includes(v)) {
		newConfig.possibleValues.push(v)
	}
	newPossibleValue.value = ''
}

function addDefaultValue() {
	const v = newDefaultValue.value.trim()
	if (v && !newConfig.defaultValues.includes(v)) {
		newConfig.defaultValues.push(v)
	}
	newDefaultValue.value = ''
}

function resetCreateConfigModal() {
	showCreateConfigModal.value = false
	creatingConfig.value = false
	createConfigError.value = null
	newConfig.configId = ''
	newConfig.description = ''
	newConfig.type = 'UnicodeConfig'
	newConfig.multiValue = false
	newConfig.editable = true
	newConfig.possibleValues = []
	newConfig.defaultValues = []
	newConfig.boolDefault = 'false'
	newPossibleValue.value = ''
	newDefaultValue.value = ''
}

async function handleCreateConfig() {
	createConfigError.value = null
	if (!newConfig.configId.trim()) return
	creatingConfig.value = true
	try {
		const payload: Parameters<typeof createConfig>[0] = {
			configId: newConfig.configId.trim(),
			type: newConfig.type,
			editable: newConfig.editable,
			multiValue: newConfig.multiValue,
			description: newConfig.description,
		}
		if (newConfig.type === 'UnicodeConfig') {
			payload.possibleValues = newConfig.possibleValues
			payload.defaultValues = newConfig.defaultValues
		} else {
			payload.defaultValues = [newConfig.boolDefault]
		}
		await createConfig(payload)
		resetCreateConfigModal()
		await fetchParameters()
	} catch (e: unknown) {
		createConfigError.value = e instanceof Error ? e.message : String(e)
	} finally {
		creatingConfig.value = false
	}
}

const activeTab = ref(props.tab || 'parameters')
watch(() => props.tab, (v) => { if (v) activeTab.value = v })
watch(activeTab, (v) => emit('update:tab', v))

const hostSelectorModel = ref<string>(props.hostId || '')
watch(() => props.hostId, (v) => { hostSelectorModel.value = v || '' })
watch(hostSelectorModel, (v) => emit('update:hostId', v || null))

const showLeaveWarning = ref(false)
let resolveLeave: ((ok: boolean) => void) | null = null

const showUnsavedModal = computed(() => hasAnyChanges.value || changedParams.value.size > 0 || hasAttributeChanges.value)

const unsavedChangesRef = computed(() => ({
	hasAnyChanges: hasAnyChanges.value,
	isSaving: isSaving.value,
	changedCount: changedCount.value,
	changedParams: changedParams.value,
	changedAttributesList: changedAttributesList.value,
	saveAll,
	discardAll,
	discardSingleParam,
	discardSingleAttribute,
	getOriginalParamValue,
	fmtVal,
}))

onBeforeRouteLeave(() => {
	if (!hasAnyChanges.value) return true
	showLeaveWarning.value = true
	return new Promise<boolean>((resolve) => {
		resolveLeave = resolve
	})
})

function confirmLeave() {
	showLeaveWarning.value = false
	discardAll()
	resolveLeave?.(true)
	resolveLeave = null
}

function cancelLeave() {
	showLeaveWarning.value = false
	resolveLeave?.(false)
	resolveLeave = null
}

const showParamChanges = ref(false)
const showAttrChanges = ref(false)

const tabDefs = computed(() => [
	{ label: (!props.hostId && props.hostType === 'server') ? String($t('parameters(default)')) : String($t('parameters')), value: 'parameters' },
	{ label: String($t('attributes')), value: 'attributes' },
])
const loadingParams = ref(false)
const savingParams = ref(false)
const rawParams = shallowRef<Record<string, Param[]>>({})
const changedParams = ref(new Map<string, unknown>())
const _internalSearch = ref('')
const paramSearch = computed({
	get: () => props.search !== undefined ? props.search : _internalSearch.value,
	set: (v: string) => {
		if (props.search !== undefined) emit('update:search', v)
		else _internalSearch.value = v
	},
})
const activeCategory = ref('all')

const flatParams = computed<Param[]>(() => {
	const all: Param[] = []
	for (const [category, items] of Object.entries(rawParams.value)) {
		for (const p of items) {
			if (p.configId) {
				const prefixed = p.configId.startsWith(category + ".") ? p.configId : `${category}.${p.configId}`
				all.push({ ...p, configId: prefixed })
			}
		}
	}
	return all.sort((a, b) => a.configId.localeCompare(b.configId))
})

const filteredFlatParams = computed(() => {
	const q = paramSearch.value.trim().toLowerCase()
	if (!q) return flatParams.value
	return flatParams.value.filter(
		(p) =>
			p.configId.toLowerCase().includes(q) ||
			(p.description || '').toLowerCase().includes(q),
	)
})

const groupedFilteredParams = computed(() => {
	const result: Record<string, Param[]> = {}
	for (const p of filteredFlatParams.value) {
		const [categoryRaw] = p.configId.split('.', 1)
		const category = categoryRaw || '_uncategorized'
		if (!result[category]) result[category] = []
		result[category].push(p)
	}
	return result
})

function currentValue(p: Param): unknown {
	if (changedParams.value.has(p.configId)) return changedParams.value.get(p.configId)
	if (props.hostId) return p.objects?.[props.hostId] ?? p.defaultValues?.[0] ?? ''
	return p.defaultValues?.[0] ?? ''
}

function fmtVal(v: unknown): string {
	if (v === null || v === undefined) return '-'
	if (Array.isArray(v)) return v.join(', ')
	return String(v)
}

function setParam(p: Param, value: unknown) {
	const orig = props.hostId ? (p.objects?.[props.hostId] ?? p.defaultValues?.[0]) : p.defaultValues?.[0]
	if (JSON.stringify(orig) === JSON.stringify(value)) changedParams.value.delete(p.configId)
	else changedParams.value.set(p.configId, value)
}

function getOriginalParamValue(configId: string): unknown {
	const p = flatParams.value.find((fp) => fp.configId === configId)
	if (!p) return undefined
	if (props.hostId) return p.objects?.[props.hostId] ?? p.defaultValues?.[0]
	return p.defaultValues?.[0]
}

function discardSingleParam(configId: string) {
	const next = new Map(changedParams.value)
	next.delete(configId)
	changedParams.value = next
}

const loadingAttrs = ref(false)
const savingAttrs = ref(false)
const originalAttributes = ref<Record<string, unknown>>({})
const editableAttributes = ref<Record<string, unknown>>({})

const hasAttributeChanges = computed(() =>
	Object.keys(editableAttributes.value).some(
		(k) => !isReadonlyAttribute(k) && JSON.stringify(originalAttributes.value[k]) !== JSON.stringify(editableAttributes.value[k]),
	),
)
watch(hasAttributeChanges, (v) => emit('attribute-change', v))

const changedAttributesList = computed(() =>
	Object.keys(editableAttributes.value)
		.filter((k) => !isReadonlyAttribute(k) && JSON.stringify(originalAttributes.value[k]) !== JSON.stringify(editableAttributes.value[k]))
		.map((k) => ({
			key: k,
			label: getAttributeLabel(k),
			oldValue: originalAttributes.value[k],
			newValue: editableAttributes.value[k],
		}))
)

function discardSingleAttribute(key: string) {
	editableAttributes.value = { ...editableAttributes.value, [key]: originalAttributes.value[key] }
}

const READONLY_KEYS = ['type', 'created', 'lastSeen', 'systemUUID', 'hostId', 'depotId', 'id']
const PASSWORD_KEYS = ['opsiHostKey', 'oneTimePassword']
const ATTR_LABELS: Record<string, string> = {
	hostId: 'Host ID', depotId: 'Depot ID', description: 'Description', notes: 'Notes',
	hardwareAddress: 'MAC Address', ipAddress: 'IP Address', inventoryNumber: 'Inventory #',
	created: 'Created', lastSeen: 'Last Seen', systemUUID: 'System UUID',
	opsiHostKey: 'OPSI Host Key', oneTimePassword: 'One-Time Password', type: 'Type',
	isMasterDepot: 'Is Master Depot', masterDepotId: 'Master Depot ID',
	networkAddress: 'Network Address', depotRemoteUrl: 'Depot URL',
}

const isReadonlyAttribute = (k: string) => READONLY_KEYS.includes(k)
const isPasswordAttribute = (k: string) => PASSWORD_KEYS.includes(k)
const getAttributeLabel = (k: string) =>
	ATTR_LABELS[k] || k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())

const readonlyAttrKeys = computed(() =>
	Object.keys(editableAttributes.value).filter((k) => isReadonlyAttribute(k)),
)
const editableAttrKeys = computed(() =>
	Object.keys(editableAttributes.value).filter((k) => !isReadonlyAttribute(k)),
)
const attributeSearch = computed(() => paramSearch.value.trim().toLowerCase())

const filteredReadonlyAttrKeys = computed(() =>
	readonlyAttrKeys.value.filter((k) =>
		getAttributeLabel(k).toLowerCase().includes(attributeSearch.value) ||
		String(originalAttributes.value[k] ?? '').toLowerCase().includes(attributeSearch.value)
	)
)

const filteredEditableAttrKeys = computed(() =>
	editableAttrKeys.value.filter((k) =>
		getAttributeLabel(k).toLowerCase().includes(attributeSearch.value) ||
		String(editableAttributes.value[k] ?? '').toLowerCase().includes(attributeSearch.value)
	)
)

async function fetchParameters() {
	loadingParams.value = true
	try {
		if (props.hostId) {
			const { data } = await getHostConfigObjects(props.hostId)
			rawParams.value = (data as Record<string, Param[]>) || {}
		} else if (props.hostType === 'server') {
			const { data } = await getServerDefaultConfig()
			rawParams.value = (data as Record<string, Param[]>) || {}
		} else {
			rawParams.value = {}
		}
	} catch { rawParams.value = {} }
	finally { loadingParams.value = false }
}

async function fetchAttributes() {
	if (!props.hostId) { originalAttributes.value = {}; editableAttributes.value = {}; return }
	loadingAttrs.value = true
	try {
		const fetcher = props.hostType === 'server'
			? getServerAttributes(props.hostId)
			: getHostAttributes(props.hostId)
		const { data } = await fetcher
		const attrs = (data as Array<Record<string, unknown>>)?.[0] || {}
		originalAttributes.value = { ...attrs }
		editableAttributes.value = { ...attrs }
	} catch { originalAttributes.value = {}; editableAttributes.value = {} }
	finally { loadingAttrs.value = false }
}

watch(() => props.hostId, async (newId) => {
	changedParams.value.clear()
	_internalSearch.value = ''
	if (props.search !== undefined) emit('update:search', '')
	activeCategory.value = 'all'
	await fetchParameters()
	if (newId) await fetchAttributes()
	else { originalAttributes.value = {}; editableAttributes.value = {} }
}, { immediate: true })

watch(() => props.hostType, async (type) => {
	if (type === 'server' && !props.hostId) await fetchParameters()
}, { immediate: false })

async function saveParameters() {
	savingParams.value = true
	try {
		const changes = Array.from(changedParams.value.entries()).map(([configId, value]) => ({ configId, value }))
		if (props.hostId) await saveHostConfigState(props.hostId, changes)
		else await saveServerConfigValues(changes)
		changedParams.value.clear()
		await fetchParameters()
		emit('saved')
	} finally { savingParams.value = false }
}

function discardParams() { changedParams.value.clear(); showParamChanges.value = false }

async function saveAttributes() {
	if (!props.hostId) return
	savingAttrs.value = true
	try {
		if (props.hostType === 'server') await updateServerAttributes(props.hostId, { ...editableAttributes.value })
		else await updateClientAttributes(props.hostId, { ...editableAttributes.value })
		originalAttributes.value = { ...editableAttributes.value }
		emit('saved')
	} finally { savingAttrs.value = false }
}

function discardAttributeChanges() { editableAttributes.value = { ...originalAttributes.value }; showAttrChanges.value = false }

const hasParamChanges = computed(() => changedParams.value.size > 0)
const hasAnyChanges = computed(() => hasParamChanges.value || hasAttributeChanges.value)
const changedCount = computed(() => changedParams.value.size + changedAttributesList.value.length)
const isSaving = computed(() => savingParams.value || savingAttrs.value)

function isAttrChanged(key: string): boolean {
	return !isReadonlyAttribute(key) &&
		JSON.stringify(originalAttributes.value[key]) !== JSON.stringify(editableAttributes.value[key])
}

async function saveAll() {
	if (hasParamChanges.value) await saveParameters()
	if (hasAttributeChanges.value) await saveAttributes()
}

function discardAll() {
	discardParams()
	discardAttributeChanges()
}

async function refresh() {
	changedParams.value.clear()
	await fetchParameters()
	if (props.hostId) await fetchAttributes()
}

defineExpose({
	refresh,
	hasParamChanges,
	hasAttributeChanges,
	hasAnyChanges,
	changedCount,
	isSaving,
	changedParams,
	changedAttributesList,
	paramSearch,
	saveParameters,
	discardParams,
	saveAttributes,
	discardAttributeChanges,
	discardSingleParam,
	discardSingleAttribute,
	saveAll,
	discardAll,
	getOriginalParamValue,
	fmtVal,
})
</script>
