<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

HostConfigTabs - Parameters and Attributes tabs.
-->
<template>
	<div :class="['flex flex-col', panelMode ? '' : 'h-full min-h-0']">
		<!-- Internal tab nav  -->
		<SharedTabsNav v-if="showTabs" v-model="activeTab" :tabs="tabDefs" class="mb-3 shrink-0" />

		<!-- PARAMETERS TAB  -->
		<div v-show="activeTab === 'parameters'" :class="['flex flex-col', panelMode ? '' : 'min-h-0 h-full']">
			<div class="shrink-0 flex flex-wrap items-center gap-2 mb-3">
				<UInput v-if="search === undefined" v-model="paramSearch" :placeholder="$t('typeToFilter')" size="xs"
					class="w-44" />
			</div>

			<!-- Inline changes overview -->
			<div v-if="showChangeBanner && changedParams.size > 0"
				class="shrink-0 mb-3 rounded-lg border border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/10 p-2">
				<div class="flex items-center justify-between">
					<button
						class="flex items-center gap-1 text-xs font-medium text-yellow-800 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-200"
						@click="showParamChanges = !showParamChanges">
						<UIcon :name="showParamChanges ? icons.collapse : icons.expand" class="w-3 h-3" />
						{{ $t('unsavedChanges') }} ({{ changedParams.size }})
					</button>
					<UButton size="xs" variant="ghost" color="warning" @click="discardParams">{{ $t('discardAll') }}
					</UButton>
				</div>
				<div v-if="showParamChanges" class="mt-2 space-y-1 max-h-40 overflow-auto">
					<div v-for="[id, val] in changedParams" :key="id"
						class="flex items-center gap-2 text-xs py-1 px-1.5 rounded bg-white dark:bg-yellow-900/20">
						<span class="font-mono flex-1 min-w-0 truncate" :title="id">{{ id }}</span>
						<span class="text-muted max-w-20 truncate shrink-0"
							:title="fmtVal(getOriginalParamValue(id))">{{ fmtVal(getOriginalParamValue(id)) }}</span>
						<UIcon name="i-heroicons-arrow-right" class="w-3 h-3 text-opsi-blue shrink-0" />
						<span class="max-w-20 truncate font-medium shrink-0" :title="fmtVal(val)">{{ fmtVal(val)
						}}</span>
						<UButton size="xs" variant="ghost" color="neutral" :icon="icons.close"
							:title="$t('discardItem')" @click="discardSingleParam(id)" />
					</div>
				</div>
			</div>

			<div v-if="loadingParams" class="py-8 flex justify-center">
				<UIcon :name="icons.loading" class="w-6 h-6 animate-spin text-opsi-blue" />
			</div>

			<!-- Empty -->
			<div v-else-if="filteredParams.length === 0" class="py-8 text-center text-sm text-muted">
				<UIcon :name="icons.config" class="w-10 h-10 mx-auto mb-2 opacity-40" />
				<p>{{ (hostId || hostType === 'server') ? $t('noParametersFound') : $t('selectHostFirst') }}</p>
			</div>

			<!-- Param rows  -->
			<div v-else
				:class="['overflow-auto divide-y divide-[var(--color-border)]', panelMode ? '' : 'flex-1 min-h-0']">
				<div v-for="p in filteredParams" :key="p.configId"
					class="grid grid-cols-1 sm:grid-cols-[1fr_240px] items-start sm:items-center gap-x-6 gap-y-1 py-2.5 px-2 hover:bg-[var(--color-surface)] transition-colors"
					:class="changedParams.has(p.configId) ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''">
					<!-- Left: id + description tooltip -->
					<div class="min-w-0">
						<div class="flex items-center gap-1 min-w-0">
							<span class="font-mono text-sm truncate font-medium" :title="p.configId">{{ p.configId
							}}</span>
							<UButton v-if="p.description" size="xs" icon="i-lucide-info" variant="ghost" color="neutral"
								class="shrink-0 opacity-60 hover:opacity-100" tabindex="-1" :title="p.description" />
						</div>
						<span v-if="changedParams.has(p.configId)"
							class="inline-flex items-center gap-1 text-[10px] text-yellow-700 dark:text-yellow-400 mt-0.5">
							<UIcon name="i-heroicons-pencil-square" class="w-3 h-3" />
							{{ $t('modified') }}
						</span>
					</div>
					<div class="flex items-center gap-1 w-full">
						<UToggle v-if="p.type === 'BoolConfig'" :model-value="Boolean(currentValue(p))"
							:disabled="readonly || !p.editable" size="sm"
							@update:model-value="(v: boolean) => setParam(p, v)" />
						<USelect v-else-if="p.possibleValues?.length && !p.multiValue"
							:model-value="String(currentValue(p))"
							:items="p.possibleValues.map((pv) => ({ label: String(pv), value: String(pv) }))"
							:disabled="readonly || !p.editable" size="sm" class="flex-1"
							@update:model-value="(v: string) => setParam(p, v)" />
						<UInput v-else-if="p.multiValue" :model-value="fmtVal(currentValue(p))"
							:disabled="readonly || !p.editable" size="sm" class="flex-1 font-mono"
							:title="fmtVal(currentValue(p))"
							@update:model-value="(v: string) => setParam(p, v.split(',').map((s) => s.trim()))" />
						<UInput v-else :model-value="String(currentValue(p) ?? '')" :disabled="readonly || !p.editable"
							size="sm" class="flex-1 font-mono" @update:model-value="(v: string) => setParam(p, v)" />
						<!-- Per-row discard when changed -->
						<UButton v-if="changedParams.has(p.configId)" size="xs" variant="ghost" color="neutral"
							:icon="icons.close" :title="$t('discardItem')" @click="discardSingleParam(p.configId)" />
					</div>
				</div>
			</div>
		</div>

		<!-- ATTRIBUTES TAB -->
		<div v-show="activeTab === 'attributes'" :class="['flex flex-col', panelMode ? '' : 'min-h-0 h-full']">
			<div v-if="showChangeBanner && hasAttributeChanges"
				class="shrink-0 mb-3 rounded-lg border border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/10 p-2">
				<div class="flex items-center justify-between">
					<button
						class="flex items-center gap-1 text-xs font-medium text-yellow-800 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-200"
						@click="showAttrChanges = !showAttrChanges">
						<UIcon :name="showAttrChanges ? icons.collapse : icons.expand" class="w-3 h-3" />
						{{ $t('unsavedChanges') }} ({{ changedAttributesList.length }})
					</button>
					<UButton size="xs" variant="ghost" color="warning" @click="discardAttributeChanges">{{
						$t('discardAll') }}</UButton>
				</div>
				<div v-if="showAttrChanges" class="mt-2 space-y-1">
					<div v-for="item in changedAttributesList" :key="item.key"
						class="flex items-center gap-2 text-xs py-1 px-1.5 rounded bg-white dark:bg-yellow-900/20">
						<span class="flex-1 min-w-0 truncate" :title="item.key">{{ item.label }}</span>
						<span class="text-muted max-w-20 truncate shrink-0" :title="fmtVal(item.oldValue)">{{
							fmtVal(item.oldValue) }}</span>
						<UIcon name="i-heroicons-arrow-right" class="w-3 h-3 text-opsi-blue shrink-0" />
						<span class="max-w-20 truncate font-medium shrink-0" :title="fmtVal(item.newValue)">{{
							fmtVal(item.newValue) }}</span>
						<UButton size="xs" variant="ghost" color="neutral" :icon="icons.close"
							:title="$t('discardItem')" @click="discardSingleAttribute(item.key)" />
					</div>
				</div>
			</div>

			<div v-if="loadingAttrs" class="py-8 flex justify-center">
				<UIcon :name="icons.loading" class="w-6 h-6 animate-spin text-opsi-blue" />
			</div>

			<div v-else-if="!hostId" class="py-8 text-center text-sm text-muted">
				<p>{{ $t('selectHostFirst') }}</p>
			</div>

			<!-- Attributes form  -->
			<div v-else :class="['overflow-auto', panelMode ? '' : 'flex-1 min-h-0']">
				<!-- read-only group -->
				<div v-if="readonlyAttrKeys.length" class="mb-6">
					<div class="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]">
						<div v-for="key in readonlyAttrKeys" :key="key"
							class="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-x-6 gap-y-0.5 px-4 py-2.5">
							<label class="text-sm font-medium text-default shrink-0">{{
								getAttributeLabel(key) }}</label>
							<span class="text-sm font-mono text-muted">{{ fmtVal(originalAttributes[key]) }}</span>
						</div>
					</div>
				</div>

				<!-- Editable group -->
				<div v-if="editableAttrKeys.length" class="mb-6">
					<p class="text-[10px] font-semibold uppercase tracking-wide text-muted mb-2">
						{{ $t('editableFields') }}
					</p>
					<div class="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]">
						<div v-for="key in editableAttrKeys" :key="key"
							class="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-x-6 gap-y-1.5 px-4 py-2.5 hover:bg-[var(--color-surface)] transition-colors"
							:class="isAttrChanged(key) ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''">
							<label class="text-sm font-medium text-default shrink-0 flex items-center gap-1">
								{{ getAttributeLabel(key) }}
								<span v-if="isAttrChanged(key)"
									class="inline-flex items-center text-[10px] text-yellow-700 dark:text-yellow-400">
									<UIcon name="i-heroicons-pencil-square" class="w-3 h-3" />
								</span>
							</label>
							<div class="flex items-center gap-1 min-w-0">
								<!-- Boolean (from API as real boolean) -->
								<UToggle v-if="typeof originalAttributes[key] === 'boolean'"
									v-model="(editableAttributes as Record<string, boolean>)[key]"
									:disabled="readonly" />
								<!-- isMasterDepot may come as string -->
								<UToggle v-else-if="key === 'isMasterDepot'"
									:model-value="editableAttributes[key] === true || editableAttributes[key] === 'true'"
									:disabled="readonly"
									@update:model-value="(v: boolean) => { editableAttributes[key] = v }" />
								<!-- Password with eye toggle -->
								<template v-else-if="isPasswordAttribute(key)">
									<UInput v-model="(editableAttributes as Record<string, string>)[key]"
										:type="shownPasswords.has(key) ? 'text' : 'password'" size="sm"
										:disabled="readonly" class="flex-1 font-mono" />
									<UButton size="xs" variant="ghost" color="neutral"
										:icon="shownPasswords.has(key) ? icons.eyeOff : icons.eye"
										:title="shownPasswords.has(key) ? $t('hidePassword') : $t('showPassword')"
										@click="togglePassword(key)" />
								</template>
								<!-- Generic text -->
								<UInput v-else v-model="(editableAttributes as Record<string, string>)[key]" size="sm"
									:disabled="readonly" class="flex-1" />
								<!-- Per-row discard -->
								<UButton v-if="isAttrChanged(key)" size="xs" variant="ghost" color="neutral"
									:icon="icons.close" :title="$t('discardItem')"
									@click="discardSingleAttribute(key)" />
							</div>
						</div>
					</div>
				</div>

				<p v-if="!readonlyAttrKeys.length && !editableAttrKeys.length"
					class="text-sm text-muted text-center py-4">
					{{ $t('noAttributesFound') }}
				</p>
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
	showChangeBanner?: boolean
	panelMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	hostId: null,
	hostType: 'client',
	readonly: false,
	tab: '',
	showTabs: true,
	search: undefined,
	showChangeBanner: true,
	panelMode: false,
})

const emit = defineEmits<{
	saved: []
	'attribute-change': [hasChanges: boolean]
	'update:search': [value: string]
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
} = useApiHelpers()

const activeTab = ref(props.tab || 'parameters')
watch(() => props.tab, (v) => { if (v) activeTab.value = v })

const showParamChanges = ref(false)
const showAttrChanges = ref(false)

const tabDefs = computed(() => [
	{ label: props.hostId ? String($t('parameters')) : String($t('parameters(default)')), value: 'parameters' },
	{ label: String($t('attributes')), value: 'attributes' },
])
const loadingParams = ref(false)
const savingParams = ref(false)
const rawParams = ref<Record<string, Param[]>>({})
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

const CATEGORY_PREFIXES: Record<string, string> = {
	general: 'general',
	clientconfig: 'clientconfig',
	'opsi-script': 'opsi-script',
	opsiclientd: 'opsiclientd',
	'software-on-demand': 'software-on-demand',
	licensing: 'licens',
}

function getCategoryForId(id: string): string {
	for (const [cat, prefix] of Object.entries(CATEGORY_PREFIXES)) {
		if (id.startsWith(prefix)) return cat
	}
	return 'other'
}

const flatParams = computed<Param[]>(() => {
	const all: Param[] = []
	for (const items of Object.values(rawParams.value)) {
		all.push(...items.filter((i) => i.configId))
	}
	return all.sort((a, b) => a.configId.localeCompare(b.configId))
})


const filteredParams = computed<Param[]>(() => {
	let list = flatParams.value
	if (activeCategory.value !== 'all') {
		list = list.filter((p) => getCategoryForId(p.configId) === activeCategory.value)
	}
	if (paramSearch.value.trim()) {
		const q = paramSearch.value.toLowerCase()
		list = list.filter((p) =>
			p.configId.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q),
		)
	}
	return list
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
const shownPasswords = ref(new Set<string>())

function togglePassword(key: string) {
	const next = new Set(shownPasswords.value)
	if (next.has(key)) next.delete(key)
	else next.add(key)
	shownPasswords.value = next
}

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
