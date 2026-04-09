<template>
	<UTooltip v-if="hasSelections && compact" :text="$t('productQuickActions')">
		<UButton variant="soft" color="primary" size="sm" @click="dialogOpen = true">
			<UIcon :name="icons.product" class="w-4 h-4" />
		</UButton>
	</UTooltip>
	<UButton v-else-if="hasSelections" color="primary" size="sm" @click="dialogOpen = true">
		<UIcon :name="icons.product" class="w-4 h-4" />
		<span class="hidden sm:inline">{{ $t('productQuickActions') }}</span>
	</UButton>
	<UTooltip v-else-if="compact" :text="$t('productQuickActions')">
		<UButton variant="ghost" color="neutral" size="sm" class="opacity-70" disabled>
			<UIcon :name="icons.product" class="w-4 h-4" />
		</UButton>
	</UTooltip>
	<UButton v-else variant="ghost" color="neutral" size="sm" class="opacity-70" disabled>
		<UIcon :name="icons.product" class="w-4 h-4" />
		<span class="hidden sm:inline">{{ $t('productQuickActions') }}</span>
	</UButton>

	<UModal v-model:open="dialogOpen" :dismissible="true" :ui="{ content: 'max-w-sm sm:max-w-2xl' }">
		<template #content>
			<UCard class="min-w-120">
				<template #header>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<UIcon :name="icons.product" class="w-5 h-5 text-(--color-text-muted)" />
							<span class="font-medium">{{ $t('productQuickActions') }}</span>
						</div>
						<UButton variant="ghost" color="neutral" size="xs" :icon="icons.x"
							@click="dialogOpen = false" />
					</div>
				</template>

				<div v-if="loadingOptions" class="flex justify-center py-8">
					<SharedLoadingSpinner size="md" />
				</div>

				<div v-else class="space-y-4">
					<SharedAlertInline v-if="errorMessage" color="error" :description="errorMessage" variant="subtle"
						closable @close="errorMessage = null" />

					<div class="divide-y divide-(--color-border)">
						<div class="form-row flex flex-col md:flex-row items-start gap-y-1 gap-x-4 py-2.5">
							<span class="font-heading text-xs text-(--color-text-muted) md:w-1/3 shrink-0">
								{{ $t('conditions') }}
							</span>
							<div class="flex-1 space-y-2">
								<div class="grid grid-cols-2 gap-2">
									<div>
										<label class="text-xs text-(--color-text-muted) block mb-1">
											{{ $t('installationStatus') }}
										</label>
										<USelect v-model="filters.installationStatus" :items="installationStatusOptions"
											size="xs" class="w-full" @update:model-value="fetchPreview" />
									</div>
									<div>
										<label class="text-xs text-(--color-text-muted) block mb-1">
											{{ $t('actionResult') }}
										</label>
										<USelect v-model="filters.actionResult" :items="actionResultOptions" size="xs"
											class="w-full" @update:model-value="fetchPreview" />
									</div>
								</div>
								<label class="flex items-center gap-2 cursor-pointer">
									<UCheckbox v-model="filters.outdatedOnly" @update:model-value="fetchPreview" />
									<span class="text-xs">{{ $t('outdatedOnClient') }}</span>
								</label>
							</div>
						</div>

						<div class="form-row flex flex-col md:flex-row items-start gap-y-1 gap-x-4 py-2.5">
							<span class="font-heading text-xs text-(--color-text-muted) md:w-1/3 shrink-0">
								{{ $t('actionRequest') }}
							</span>
							<div class="flex-1">
								<USelect v-model="actionRequest" :items="actionRequestOptions" size="sm" class="w-full"
									@update:model-value="fetchPreview" />
							</div>
						</div>

						<div class="form-row flex flex-col md:flex-row items-start gap-y-1 gap-x-4 py-2.5">
							<span class="font-heading text-xs text-(--color-text-muted) md:w-1/3 shrink-0">
								{{ $t('scope') }}
							</span>
							<div class="flex-1">
								<USelect v-model="scope" :items="scopeOptions" size="sm" class="w-full"
									@update:model-value="fetchPreview" />
							</div>
						</div>
					</div>

					<div>
						<div class="flex items-center justify-between mb-1.5">
							<span class="font-heading text-xs text-(--color-text-muted)">
								{{ $t('preview') }}
							</span>
							<div class="flex items-center gap-2">
								<UButton size="xs" variant="ghost" color="neutral" :icon="icons.refresh"
									:loading="loadingPreview" @click="fetchPreview" />
								<UBadge color="neutral" variant="soft" size="xs">
									{{ previewCount }}
								</UBadge>
							</div>
						</div>

						<div class="border border-(--color-border) rounded-lg bg-(--color-surface)" style="min-height: 180px;">
							<div v-if="loadingPreview" class="flex justify-center items-center" style="min-height: 180px;">
								<SharedLoadingSpinner size="sm" />
							</div>
							<div v-else-if="previewData && Object.keys(previewData).length > 0"
								class="max-h-64 overflow-y-auto text-xs">
								<table class="min-w-full table-auto">
									<thead class="bg-(--color-surface) sticky top-0 z-10">
										<tr class="text-left text-(--color-text-muted)">
											<th class="px-2 py-1.5 font-medium">{{ $t('clientId') }}</th>
											<th class="px-2 py-1.5 font-medium">{{ $t('productId') }}</th>
											<th class="px-2 py-1.5 font-medium">{{ $t('version') }}</th>
											<th class="px-2 py-1.5 font-medium">{{ $t('actionRequest') }}</th>
											<th class="px-2 py-1.5 font-medium">{{ $t('installationStatus') }}</th>
										</tr>
									</thead>
									<tbody class="divide-y divide-(--color-border)">
										<template v-for="(products, clientId) in previewData" :key="clientId">
											<tr v-for="p in products" :key="`${clientId}-${p.productId}`"
												class="hover:bg-(--color-surface-hover)">
												<td class="px-2 py-1 truncate max-w-40" :title="String(clientId)">{{ clientId }}</td>
												<td class="px-2 py-1 truncate max-w-32" :title="p.productId">{{ p.productId }}</td>
												<td class="px-2 py-1 text-(--color-text-muted) whitespace-nowrap">
													{{ p.productVersion && p.packageVersion ? `${p.productVersion}-${p.packageVersion}` : '-' }}
												</td>
												<td class="px-2 py-1 whitespace-nowrap">{{ p.actionRequest || actionRequest }}</td>
												<td class="px-2 py-1 text-(--color-text-muted) whitespace-nowrap">{{ p.installationStatus || '-' }}</td>
											</tr>
										</template>
									</tbody>
								</table>
							</div>
							<div v-else-if="previewData !== null"
								class="flex justify-center items-center text-xs text-(--color-text-muted)" style="min-height: 180px;">
								{{ $t('noProductsMatchCriteria') }}
							</div>
							<div v-else
								class="flex justify-center items-center text-xs text-(--color-text-muted)" style="min-height: 180px;">
								--
							</div>
						</div>
					</div>
				</div>

				<template #footer>
					<div class="flex justify-end gap-2">
						<UButton variant="soft" color="neutral" size="sm" @click="resetForm">{{ $t('reset') }}</UButton>
						<UButton color="primary" size="sm" :disabled="isReadOnly || previewData == null || applying"
							:loading="applying" @click="applyActions">
							{{ $t('apply') }}
						</UButton>
					</div>
				</template>
			</UCard>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import { useSelectionStore } from '~/stores/selectionStore'
import type { ProductRow } from '~/types'

interface Props {
	products?: ProductRow[]
	compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	products: () => [],
	compact: false,
})

const emit = defineEmits<{
	applied: []
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const { getInstallationStatuses, getActionResults, bulkProductAction } = useApiHelpers()
const selectionStore = useSelectionStore()
const { isReadOnly } = useUserPermissions()

const NOT_APPLIED = String($t('notApplied'))

const dialogOpen = ref(false)
const loadingOptions = ref(false)
const loadingPreview = ref(false)
const applying = ref(false)
const errorMessage = ref<string | null>(null)

const hasSelections = computed(() =>
	selectionStore.selectedClients.length > 0 || selectionStore.selectedServers.length > 0
)

const filters = ref({ installationStatus: NOT_APPLIED, actionResult: NOT_APPLIED, outdatedOnly: false })
const actionRequest = ref(NOT_APPLIED)
const scope = ref('clients')

const installationStatusOptions = ref([
	{ value: NOT_APPLIED, label: NOT_APPLIED },
	{ value: 'installed', label: 'installed' },
	{ value: 'not_installed', label: 'not_installed' },
	{ value: 'unknown', label: 'unknown' },
])

const actionResultOptions = ref([
	{ value: NOT_APPLIED, label: NOT_APPLIED },
	{ value: 'failed', label: 'failed' },
	{ value: 'successful', label: 'successful' },
	{ value: 'none', label: 'none' },
])

const actionRequestOptions = [
	{ value: NOT_APPLIED, label: NOT_APPLIED },
	{ value: 'none', label: 'none' },
	{ value: 'setup', label: 'setup' },
	{ value: 'uninstall', label: 'uninstall' },
	{ value: 'update', label: 'update' },
	{ value: 'always', label: 'always' },
	{ value: 'once', label: 'once' },
	{ value: 'custom', label: 'custom' },
]

const scopeOptions = [
	{ value: 'both', label: String($t('toBothSelectedServersAndClients')) },
	{ value: 'servers', label: String($t('toSelectedServers')) },
	{ value: 'clients', label: String($t('toSelectedClients')) },
]

interface PreviewProduct {
	productId: string
	productType?: string
	productVersion?: string
	packageVersion?: string
	actionRequest?: string
	installationStatus?: string
}

const previewData = ref<Record<string, PreviewProduct[]> | null>(null)

const previewCount = computed(() => {
	if (!previewData.value) return 0
	return Object.values(previewData.value).reduce((sum, arr) => sum + arr.length, 0)
})

watch(dialogOpen, async (open) => {
	if (open) {
		resetForm()
		await fetchOptions()
	}
})

async function fetchOptions() {
	loadingOptions.value = true
	try {
		const [statusResult, resultResult] = await Promise.all([
			getInstallationStatuses(),
			getActionResults(),
		])
		if (statusResult.data) {
			installationStatusOptions.value = [
				{ value: NOT_APPLIED, label: NOT_APPLIED },
				...(statusResult.data as string[]).map((s: string) => ({ value: s, label: s })),
			]
		}
		if (resultResult.data) {
			actionResultOptions.value = [
				{ value: NOT_APPLIED, label: NOT_APPLIED },
				...(resultResult.data as string[]).map((s: string) => ({ value: s, label: s })),
			]
		}
	} catch (e) {
		errorMessage.value = e instanceof Error ? e.message : String(e)
	} finally {
		loadingOptions.value = false
	}
}

function buildParams(demoMode: boolean): Record<string, unknown> | null {
	const includeClients = scope.value === 'both' || scope.value === 'clients'
	const includeServers = scope.value === 'both' || scope.value === 'servers'

	const instStatus = filters.value.installationStatus === NOT_APPLIED ? null : filters.value.installationStatus
	const actResult = filters.value.actionResult === NOT_APPLIED ? null : filters.value.actionResult
	const action = actionRequest.value === NOT_APPLIED ? '' : actionRequest.value

	if (!filters.value.outdatedOnly && instStatus === null && actResult === null) {
		previewData.value = null
		return null
	}

	if (action === '' && !demoMode) {
		errorMessage.value = String($t('message.chooseAction'))
		return null
	}

	return {
		action,
		demoMode,
		outdated: filters.value.outdatedOnly,
		installation_status: instStatus,
		action_result: actResult,
		selectedClients: includeClients && selectionStore.selectedClients.length > 0 ? selectionStore.selectedClients : null,
		selectedDepots: includeServers && selectionStore.selectedServers.length > 0 ? selectionStore.selectedServers : null,
	}
}

async function fetchPreview() {
	const params = buildParams(true)
	if (!params) return
	loadingPreview.value = true
	errorMessage.value = null
	try {
		const result = await bulkProductAction(params as Parameters<typeof bulkProductAction>[0])
		if (result.error) throw result.error
		previewData.value = (result.data || {}) as Record<string, PreviewProduct[]>
	} catch (e) {
		errorMessage.value = e instanceof Error ? e.message : String(e)
		previewData.value = null
	} finally {
		loadingPreview.value = false
	}
}

async function applyActions() {
	const params = buildParams(false)
	if (!params) return
	applying.value = true
	errorMessage.value = null
	try {
		const result = await bulkProductAction(params as Parameters<typeof bulkProductAction>[0])
		if (result.error) throw result.error
		dialogOpen.value = false
		emit('applied')
	} catch (e) {
		errorMessage.value = e instanceof Error ? e.message : String(e)
	} finally {
		applying.value = false
	}
}

function resetForm() {
	filters.value = { installationStatus: NOT_APPLIED, actionResult: NOT_APPLIED, outdatedOnly: false }
	actionRequest.value = NOT_APPLIED
	scope.value = 'clients'
	previewData.value = null
	errorMessage.value = null
}
</script>
