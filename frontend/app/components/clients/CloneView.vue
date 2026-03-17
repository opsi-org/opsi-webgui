<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

ClientsCloneView - Can be used both in standalone pages and detail panels.
-->
<template>
	<!-- Unsaved changes navigation warning -->
	<UModal v-model:open="showLeaveWarning" :title="$t('unsavedChanges')">
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

	<LayoutsPageLayout show-refresh :loading="loading" @refresh="refresh">
		<template #filters>
			<slot name="sourceSelector">
				<HostsSelector v-if="showSourceSelector" v-model="sourceSelectorModel" type="client"
					:placeholder="sourceSelectorPlaceholder" :allow-all="false" allow-clear />
			</slot>
		</template>

		<template #saveActions>
			<UInput v-model="formSearch" :placeholder="String($t('typeToFilter'))" size="sm"
				:class="panelMode ? 'w-full sm:w-32 md:w-40' : 'w-full sm:w-48 md:w-64'" icon="i-lucide-search" />
			<div class="flex gap-2">
				<UButton color="primary" :loading="saving" :disabled="loading || !canClone"
					:size="panelMode ? 'sm' : 'md'" @click="cloneClient">
					<UIcon :name="icons.clone" class="w-4 h-4 mr-1" />
					{{ $t('clone') }}
				</UButton>
			</div>
		</template>

		<!-- No Source Client Selected -->
		<div v-if="!resolvedSourceId && !loading" class="p-8 text-center rounded-lg">
			<UIcon :name="icons.client" class="w-12 h-12 mx-auto mb-3 opacity-50 text-muted" />
			<p class="text-muted">{{ $t('selectClientToClone') }}</p>
		</div>

		<!-- Clone content -->
		<ClientsCloneForm v-else ref="cloneFormRef" :source-id="resolvedSourceId || ''" :search="formSearch"
			:panel-mode="panelMode" @saved="handleSaved" @has-changes="handleHasChanges" />
	</LayoutsPageLayout>
</template>

<script setup lang="ts">
export interface ClientsCloneFormRef {
	refresh?: () => void
	hasAnyChanges?: boolean
	isSaving?: boolean
	cloneClient?: () => Promise<void>
}

interface Props {
	sourceId?: string | null
	panelMode?: boolean
	showSourceSelector?: boolean
	sourceSelectorPlaceholder?: string
	onCancelLeave?: () => void
}

const props = withDefaults(defineProps<Props>(), {
	sourceId: null,
	panelMode: false,
	showSourceSelector: false,
	sourceSelectorPlaceholder: undefined,
	onCancelLeave: undefined,
})

const emit = defineEmits<{
	'update:sourceId': [value: string | null]
	saved: []
}>()

const icons = useIcons()
const { t: $t } = useI18n()

// Source selector model for when using internal source selection
const sourceSelectorModel = ref<string>(props.sourceId || '')
watch(() => props.sourceId, (v) => { sourceSelectorModel.value = v || '' })
watch(sourceSelectorModel, (v) => emit('update:sourceId', v || null))

// Resolved source ID (either from prop or selector)
const resolvedSourceId = computed(() => props.sourceId || (props.showSourceSelector ? sourceSelectorModel.value : null))

// State management
const loading = ref(false)
const saving = ref(false)
const formSearch = ref('')
const hasChanges = ref(false)

// Form ref
const cloneFormRef = ref<ClientsCloneFormRef | null>(null)

// Computed properties
const canClone = computed(() => {
	return resolvedSourceId.value && cloneFormRef.value && !loading.value
})

// Functions
function refresh() {
	loading.value = true
	try {
		cloneFormRef.value?.refresh?.()
	} finally {
		loading.value = false
	}
}

async function cloneClient() {
	if (!cloneFormRef.value) return
	saving.value = true
	try {
		await cloneFormRef.value.cloneClient?.()
	} finally {
		saving.value = false
	}
}

function handleSaved() {
	hasChanges.value = false
	emit('saved')
}

function handleHasChanges(changes: boolean) {
	hasChanges.value = changes
}

// Unsaved changes warning similar to HostsConfigView
const showLeaveWarning = ref(false)
let resolveLeave: ((ok: boolean) => void) | null = null

onBeforeRouteLeave(() => {
	if (!hasChanges.value) return true
	showLeaveWarning.value = true
	return new Promise<boolean>((resolve) => {
		resolveLeave = resolve
	})
})

function confirmLeave() {
	showLeaveWarning.value = false
	if (resolveLeave) {
		resolveLeave(true)
		resolveLeave = null
	}
}

function cancelLeave() {
	showLeaveWarning.value = false
	if (resolveLeave) {
		resolveLeave(false)
		resolveLeave = null
	}
	props.onCancelLeave?.()
}

// Expose ref for parent components
defineExpose({
	cloneFormRef: cloneFormRef as Ref<ClientsCloneFormRef | null>,
	refresh,
	cloneClient,
	hasAnyChanges: computed(() => hasChanges.value),
})
</script>