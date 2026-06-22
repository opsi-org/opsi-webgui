<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  HostsConfigTabs - Tabbed host configuration editor with panel and standalone mode.
-->
<template>
	<CoreAppNavigationGuardModal v-if="showHostSelector || !panelMode" v-model="showLeaveWarning" @cancel="cancelLeave"
		@confirm="confirmLeave" />

	<!-- Create Config Modal -->
	<CoreAppModal v-model:open="showCreateConfigModal">
		<template #content>
			<CoreAppCard>
				<template #header>
					<div class="flex items-center gap-3">
						<CoreAppIcon :name="icons.add" class="w-5 h-5" />
						<h3 class="text-sm font-heading uppercase tracking-wide text-(--color-text) m-0">{{
							$t('config.create') }}</h3>
					</div>
				</template>
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium mb-1">{{ $t('config.id') }} *</label>
						<CoreAppInput v-model="newConfig.configId" :placeholder="'e.g. category.subcategory.name'"
							size="sm" />
					</div>
					<div>
						<label class="block text-sm font-medium mb-1">{{ $t('common.description') }}</label>
						<CoreAppInput v-model="newConfig.description" size="sm" />
					</div>
					<div>
						<label class="block text-sm font-medium mb-1">{{ $t('common.type') }}</label>
						<CoreAppSelect v-model="newConfig.type" :items="configTypeOptions" size="sm" />
					</div>
					<div class="flex items-center gap-4">
						<label class="flex items-center gap-2 text-sm">
							<CoreAppCheckbox v-model="newConfig.multiValue" size="sm" />
							{{ $t('config.multiValue') }}
						</label>
						<label class="flex items-center gap-2 text-sm">
							<CoreAppCheckbox v-model="newConfig.editable" size="sm" />
							{{ $t('common.editable') }}
						</label>
					</div>
					<div v-if="newConfig.type === 'UnicodeConfig'">
						<label class="block text-sm font-medium mb-1">{{ $t('config.possibleValues') }}</label>
						<div v-if="newConfig.possibleValues.length > 0" class="flex flex-wrap gap-1 mb-1">
							<span v-for="(val, idx) in newConfig.possibleValues" :key="idx"
								class="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-(--color-primary-soft-bg) text-(--color-primary-soft-text) border border-(--color-primary)/20">
								{{ val }}
								<CoreAppButton type="button" variant="ghost" color="neutral" size="xs"
									class="p-0! hover:text-(--color-error-soft-text) transition-colors"
									@click="newConfig.possibleValues.splice(idx, 1)">
									<CoreAppIcon :name="icons.x" class="w-3 h-3" />
								</CoreAppButton>
							</span>
						</div>
						<div class="flex gap-1">
							<CoreAppInput v-model="newPossibleValue" :placeholder="$t('common.pressEnterToAdd')" size="sm"
								class="flex-1" @keydown.enter.prevent="addPossibleValue" />
							<CoreAppButton size="sm" variant="soft" color="neutral" :icon="icons.add"
								@click="addPossibleValue" />
						</div>
					</div>
					<div v-if="newConfig.type === 'UnicodeConfig'">
						<label class="block text-sm font-medium mb-1">{{ $t('products.defaultValues') }}</label>
						<div v-if="newConfig.defaultValues.length > 0" class="flex flex-wrap gap-1 mb-1">
							<span v-for="(val, idx) in newConfig.defaultValues" :key="idx"
								class="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-(--color-primary-soft-bg) text-(--color-primary-soft-text) border border-(--color-primary)/20">
								{{ val }}
								<CoreAppButton type="button" variant="ghost" color="neutral" size="xs"
									class="p-0! hover:text-(--color-error-soft-text) transition-colors"
									@click="newConfig.defaultValues.splice(idx, 1)">
									<CoreAppIcon :name="icons.x" class="w-3 h-3" />
								</CoreAppButton>
							</span>
						</div>
						<div class="flex gap-1">
							<CoreAppInput v-model="newDefaultValue" :placeholder="$t('common.pressEnterToAdd')" size="sm"
								class="flex-1" @keydown.enter.prevent="addDefaultValue" />
							<CoreAppButton size="sm" variant="soft" color="neutral" :icon="icons.add"
								@click="addDefaultValue" />
						</div>
					</div>
					<div v-if="newConfig.type === 'BoolConfig'">
						<label class="block text-sm font-medium mb-1">{{ $t('products.defaultValues') }}</label>
						<CoreAppSelect v-model="newConfig.boolDefault"
							:items="[{ label: 'true', value: 'true' }, { label: 'false', value: 'false' }]" size="sm" />
					</div>
					<CoreAppAlertInline v-if="createConfigError" color="error" :title="$t('common.error')"
						:description="createConfigError" variant="subtle" closable @close="createConfigError = null" />
				</div>
				<template #footer>
					<div class="flex gap-2 justify-end">
						<CoreAppButton variant="ghost" color="neutral" @click="resetCreateConfigModal">{{ $t('common.cancel')
						}}
						</CoreAppButton>
						<CoreAppButton color="primary" :loading="creatingConfig" :disabled="!newConfig.configId.trim()"
							@click="handleCreateConfig">{{ $t('common.create') }}</CoreAppButton>
					</div>
				</template>
			</CoreAppCard>
		</template>
	</CoreAppModal>



	<div class="shrink-0 pb-3 sticky top-0 z-10 bg-(--color-surface) mb-3">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="flex items-center gap-2">
				<CoreAppTabsNav v-model="activeTab" :tabs="tabDefs" />
				<template v-if="showHostSelector">
					<span class="h-5 w-px bg-(--color-border) mx-1" />
					<slot name="hostSelector">
						<HostsSelector v-model="hostSelectorModel" :type="hostType"
							:placeholder="hostSelectorPlaceholder" allow-clear />
					</slot>
				</template>
			</div>
			<div class="flex flex-wrap items-center gap-2">
				<CoreAppFilterInput v-model="paramSearch" size="sm" input-class="w-full sm:w-32 md:w-40" />
				<CoreAppButton v-if="isServerDefaultMode && !readonly" :icon="icons.add" color="primary" variant="soft"
					size="sm" :title="String($t('config.create'))" @click="showCreateConfigModal = true">
					<span class="hidden sm:inline">{{ $t('config.create') }}</span>
				</CoreAppButton>
				<CoreAppUnsavedChangesModal v-if="showUnsavedModal" :config-ref="unsavedChangesRef" size="sm"
					@save-all="saveAll" @discard-all="discardAll" />
				<CoreAppButton :icon="icons.refresh" color="neutral" variant="ghost" size="sm"
					:loading="loadingParams || loadingAttrs" :title="String($t('common.refresh'))" @click="refresh" />
			</div>
		</div>
	</div>

	<div v-show="activeTab === 'parameters'"
		:class="['flex flex-col min-h-0 flex-1 overflow-auto bg-(--color-surface) px-3 pb-3']">
		<div v-if="loadingParams" class="py-8 flex justify-center">
			<CoreAppLoadingSpinner size="md" />
		</div>
		<CoreAppEmptyState v-else-if="categoryAwareTree.length === 0" :icon="icons.config"
			:message="(hostId || hostType === 'server') ? String($t('config.paramsNone')) : String($t('hosts.select'))" />
		<CoreAppCard v-else :ui="{ body: 'p-3 sm:p-3' }">
			<HostsParametersTreeForm :tree="categoryAwareTree" :changed-params="changedParams" :readonly="readonly"
				:current-value="currentValue" :set-param="setParam" :discard-single-param="discardSingleParam"
				:icons="icons" :fmt-val="fmtVal" :auto-open-all="!!paramSearch" />
		</CoreAppCard>
	</div>

	<div v-show="activeTab === 'attributes'"
		:class="['flex flex-col min-h-0 flex-1 overflow-auto bg-(--color-surface) px-3 pb-3']">
		<div v-if="loadingAttrs" class="py-8 flex justify-center">
			<CoreAppLoadingSpinner size="md" />
		</div>
		<CoreAppEmptyState v-else-if="!hostId" :icon="icons.config" :message="String($t('hosts.select'))" />
		<CoreAppCard v-else-if="filteredReadonlyAttrKeys.length || filteredEditableAttrKeys.length">
			<div v-if="filteredReadonlyAttrKeys.length"
				:class="['border-b border-(--color-border) pb-3', filteredEditableAttrKeys.length ? 'mb-3' : '']">
				<div v-for="key in filteredReadonlyAttrKeys" :key="key"
					class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
					<span class="text-sm text-(--color-text) min-w-0 md:w-1/3 break-all">
						{{ getAttributeLabel(key) }}
					</span>
					<span class="text-sm flex-1 truncate" :title="fmtVal(originalAttributes[key])">
						{{ fmtVal(originalAttributes[key]) }}
					</span>
				</div>
			</div>

			<div v-if="filteredEditableAttrKeys.length">
				<div v-for="key in filteredEditableAttrKeys" :key="key"
					class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors"
					:class="isAttrChanged(key) ? 'bg-(--color-changed-bg)' : ''">
					<span class="text-sm text-(--color-text) min-w-0 md:w-1/3 break-all">
						{{ getAttributeLabel(key) }}
						<span v-if="isAttrChanged(key)"
							class="inline-flex items-center text-xs text-(--color-changed-text)">
							<CoreAppIcon :name="icons.pencilSquare" class="w-3 h-3" />
						</span>
					</span>
					<div class="flex-1 flex items-center gap-2 min-w-0">
						<CoreAppCheckbox v-if="typeof originalAttributes[key] === 'boolean'"
							v-model="(editableAttributes as Record<string, boolean>)[key]" :disabled="readonly" />
						<CoreAppCheckbox v-else-if="key === 'isMasterDepot'"
							:model-value="editableAttributes[key] === true || editableAttributes[key] === 'true'"
							:disabled="readonly"
							@update:model-value="(v: boolean | 'indeterminate') => { editableAttributes[key] = v }" />
						<CoreAppPasswordInput v-else-if="isPasswordAttribute(key)"
							v-model="(editableAttributes as Record<string, string>)[key]" size="sm" :disabled="readonly"
							class="flex-1" :maxlength="32" />
						<CoreAppInput v-else v-model="(editableAttributes as Record<string, string>)[key]" size="sm"
							:disabled="readonly" class="flex-1" />
						<CoreAppButton v-if="isAttrChanged(key)" size="xs" variant="ghost" color="neutral"
							:icon="icons.x" :title="$t('common.discard')" @click="discardSingleAttribute(key)" />
					</div>
				</div>
			</div>
		</CoreAppCard>
	</div>

</template>

<script setup lang="ts">
interface Param {
	configId: string
	type: 'BoolConfig' | 'UnicodeConfig'
	description?: string
	defaultValues?: unknown[]
	possibleValues: unknown[]
	multiValue: boolean
	editable: boolean
	objects?: Record<string, unknown>
	value?: unknown
	newValue?: string
	newValues?: unknown[]
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

let pendingHostChangeId: string | null = null
let _ignoreHostSelectorWatch = false

watch(hostSelectorModel, (newVal) => {
	if (_ignoreHostSelectorWatch) {
		_ignoreHostSelectorWatch = false
		return
	}
	if (hasAnyChanges.value && newVal !== (props.hostId || '')) {
		pendingHostChangeId = newVal
		_ignoreHostSelectorWatch = true
		hostSelectorModel.value = props.hostId || ''
		showLeaveWarning.value = true
		return
	}
	emit('update:hostId', newVal || null)
})

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

if (!props.panelMode) {
	onBeforeRouteLeave(() => {
		if (!hasAnyChanges.value) return true
		showLeaveWarning.value = true
		return new Promise<boolean>((resolve) => {
			resolveLeave = resolve
		})
	})
}

function confirmLeave() {
	showLeaveWarning.value = false
	discardAll()
	if (pendingHostChangeId !== null) {
		const id = pendingHostChangeId
		pendingHostChangeId = null
		hostSelectorModel.value = id
		// hasAnyChanges is now false after discardAll, so the watch will emit update:hostId
	}
	resolveLeave?.(true)
	resolveLeave = null
}

function cancelLeave() {
	showLeaveWarning.value = false
	pendingHostChangeId = null
	resolveLeave?.(false)
	resolveLeave = null
}

const showParamChanges = ref(false)
const showAttrChanges = ref(false)

const tabDefs = computed(() => [
	{ label: (!props.hostId && props.hostType === 'server') ? String($t('config.paramsDefault')) : String($t('config.params')), value: 'parameters' },
	{ label: String($t('common.attributes')), value: 'attributes' },
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
	for (const items of Object.values(rawParams.value)) {
		for (const p of items) {
			if (p.configId) {
				all.push(p)
			}
		}
	}
	return all.sort((a, b) => a.configId.localeCompare(b.configId))
})

interface TreeNode {
	key: string
	label: string
	param?: Param
	children?: TreeNode[]
	leafCount?: number
}

const categoryAwareTree = computed<TreeNode[]>(() => {
	const q = paramSearch.value.trim().toLowerCase()
	const raw = rawParams.value
	const categoryOrder = ['general', 'clientconfig', 'opsi-script', 'opsiclientd', 'software-on-demand', 'licensing']
	const categoryKeys = [
		...categoryOrder.filter(k => k in raw),
		...Object.keys(raw).filter(k => !categoryOrder.includes(k)).sort(),
	]

	function buildSubTree(params: Param[], prefix: string): TreeNode[] {
		const root: Record<string, any> = {}
		for (const p of params) {
			if (q && !p.configId.toLowerCase().includes(q) && !(p.description || '').toLowerCase().includes(q)) continue
			const parts = p.configId.split('.')
			let node = root
			for (let i = 0; i < parts.length; i++) {
				const part = parts[i]
				if (!part) continue
				if (i === parts.length - 1) {
					node[part] = { __param: p }
				} else {
					node[part] = node[part] || {}
					node = node[part]
				}
			}
		}
		function toTree(obj: Record<string, any>, pre: string): TreeNode[] {
			return Object.entries(obj)
				.sort(([, a], [, b]) => {
					const aP = a && typeof a === 'object' && '__param' in a
					const bP = b && typeof b === 'object' && '__param' in b
					if (aP && !bP) return 1
					if (!aP && bP) return -1
					return 0
				})
				.map(([key, value]) => {
					if (value && typeof value === 'object' && '__param' in value) {
						return { key: pre + key, label: key, param: value.__param, leafCount: 1 }
					}
					const children = toTree(value, pre + key + '.')
					const leafCount = children.reduce((sum, c) => sum + (c.leafCount ?? 0), 0)
					return { key: pre + key, label: key, children, leafCount }
				})
				.filter(n => n.param || (n.children && n.children.length > 0))
		}
		return toTree(root, prefix)
	}

	return categoryKeys
		.map(cat => {
			const children = buildSubTree(raw[cat] || [], cat + '.')
			const leafCount = children.reduce((sum, c) => sum + (c.leafCount ?? 0), 0)
			return { key: cat, label: cat, children, leafCount }
		})
		.filter(n => n.children.length > 0)
})

function getOriginalValue(p: Param): unknown {
	let raw: unknown
	if (props.hostId && p.objects && props.hostId in p.objects) {
		raw = p.objects[props.hostId]
	} else if (!props.hostId && p.value !== undefined) {
		raw = p.value
	} else if (p.defaultValues !== undefined) {
		raw = p.defaultValues
	} else {
		raw = p.type === 'BoolConfig' ? false : ''
	}
	if (p.type === 'BoolConfig') {
		if (typeof raw === 'boolean') return raw
		if (Array.isArray(raw)) return raw.length > 0 ? Boolean(raw[0]) : false
		return Boolean(raw)
	}
	if (p.multiValue) {
		if (Array.isArray(raw)) return raw.map(String)
		if (raw === '' || raw === null || raw === undefined) return []
		return [String(raw)]
	}
	if (Array.isArray(raw)) return raw.length > 0 ? String(raw[0]) : ''
	if (raw === null || raw === undefined) return ''
	return String(raw)
}

function currentValue(p: Param): unknown {
	if (changedParams.value.has(p.configId)) return changedParams.value.get(p.configId)
	return getOriginalValue(p)
}

function fmtVal(v: unknown): string {
	if (v === null || v === undefined) return '-'
	if (Array.isArray(v)) return v.join(', ')
	return String(v)
}

function setParam(p: Param, value: unknown) {
	const orig = getOriginalValue(p)
	if (JSON.stringify(orig) === JSON.stringify(value)) changedParams.value.delete(p.configId)
	else changedParams.value.set(p.configId, value)
}

function getOriginalParamValue(configId: string): unknown {
	const p = flatParams.value.find((fp) => fp.configId === configId)
	if (!p) return undefined
	return getOriginalValue(p)
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
		// Only send changed attributes to avoid re-hashing already-stored password fields
		const changedAttrs: Record<string, unknown> = {}
		for (const key of Object.keys(editableAttributes.value)) {
			if (!isReadonlyAttribute(key) && JSON.stringify(originalAttributes.value[key]) !== JSON.stringify(editableAttributes.value[key])) {
				changedAttrs[key] = editableAttributes.value[key]
			}
		}
		if (Object.keys(changedAttrs).length === 0) return
		if (props.hostType === 'server') await updateServerAttributes(props.hostId, changedAttrs)
		else await updateClientAttributes(props.hostId, changedAttrs)
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
