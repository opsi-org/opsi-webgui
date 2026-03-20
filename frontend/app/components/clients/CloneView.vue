ClientsCloneView - Can be used both in standalone pages and detail panels.
<template>
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
			<div class="flex gap-2">
				<UTooltip :text="$t('cloneClient')">
					<UButton color="success" :loading="saving" v-if="canClone" @click="cloneClient">
						<UIcon :name="icons.clone" />
					</UButton>
				</UTooltip>
			</div>
		</template>

		<div v-if="!resolvedSourceId && !loading" class="p-8 text-center rounded-lg">
			<UIcon :name="icons.client" class="w-12 h-12 mx-auto mb-3 opacity-50 text-muted" />
			<p class="text-muted">{{ $t('selectClientToClone') }}</p>
		</div>

		<ClientsCloneForm v-else ref="cloneFormRef" :source-id="resolvedSourceId || ''" :panel-mode="panelMode"
			@saved="handleSaved" @has-changes="handleHasChanges" />
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

const sourceSelectorModel = ref<string>(props.sourceId || '')
watch(() => props.sourceId, (v) => { sourceSelectorModel.value = v || '' })
watch(sourceSelectorModel, (v) => emit('update:sourceId', v || null))

const resolvedSourceId = computed(() => props.sourceId || (props.showSourceSelector ? sourceSelectorModel.value : null))

const loading = ref(false)
const saving = ref(false)
const hasChanges = ref(false)

const cloneFormRef = ref<ClientsCloneFormRef | null>(null)

const canClone = computed(() => {
	return resolvedSourceId.value || hasChanges.value
})

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

defineExpose({
	cloneFormRef: cloneFormRef as Ref<ClientsCloneFormRef | null>,
	refresh,
	cloneClient,
	hasAnyChanges: computed(() => hasChanges.value),
})
</script>