<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

HostsConfigView - Consolidated host configuration view with tabs, search, refresh, and save functionality.
Can be used both in standalone pages and detail panels.
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

	<!-- Use PageLayout for full page mode, simple div for panel mode -->
	<LayoutsPageLayout v-if="!panelMode" show-refresh :loading="loading" @refresh="refresh">
		<template #tabs>
			<SharedTabsNav v-model="activeTab" :tabs="configTabs" />
		</template>

		<template #filters>
			<slot name="hostSelector">
				<HostsSelector v-if="showHostSelector" v-model="hostSelectorModel" :type="hostType"
					:placeholder="hostSelectorPlaceholder" allow-clear />
			</slot>
		</template>

		<template #saveActions>
			<UInput v-model="paramSearch" :placeholder="String($t('typeToFilter'))" size="sm"
				class="w-full sm:w-48 md:w-64" icon="i-lucide-search" />
			<SharedUnsavedChangesModal :config-ref="hostConfigTabsRef" size="sm" @save-all="saveAll"
				@discard-all="discardAll" />
		</template>

		<!-- Server default note when no server selected -->
		<template v-if="!resolvedHostId && activeTab === 'parameters' && hostType === 'server'">
			<div class="mb-2">
				<p class="text-xs text-muted italic">{{ $t('serverDefaultParams') }}</p>
			</div>
		</template>

		<!-- No Host Selected -->
		<div v-if="!resolvedHostId && !loading && hostType !== 'server'"
			class="p-8 text-center border border-default rounded-lg">
			<UIcon :name="hostType === 'client' ? icons.client : icons.server"
				class="w-12 h-12 mx-auto mb-3 opacity-50 text-muted" />
			<p class="text-muted">{{ hostType === 'client' ? $t('selectClientToViewConfig') :
				$t('selectServerToViewConfig')
				}}</p>
		</div>

		<!-- Config content -->
		<HostsConfigTabs v-else ref="hostConfigTabsRef" :host-id="resolvedHostId || null" :host-type="hostType"
			:tab="activeTab" :show-tabs="false" v-model:search="paramSearch" :show-change-banner="false"
			@saved="handleSaved" />
	</LayoutsPageLayout>

	<!-- Panel mode: simplified layout with controls -->
	<div v-else class="flex flex-col h-full min-h-0">
		<!-- Panel Header with controls -->
		<div class="shrink-0 pb-3 space-y-3">
			<!-- Tabs and Actions Row -->
			<div class="flex flex-wrap items-center justify-between gap-3">
				<!-- Left side: Tabs -->
				<div class="flex items-center gap-2">
					<SharedTabsNav v-model="activeTab" :tabs="configTabs" />
				</div>

				<!-- Right side: Controls -->
				<div class="flex flex-wrap items-center gap-2">
					<UInput v-model="paramSearch" :placeholder="String($t('typeToFilter'))" size="sm"
						class="w-full sm:w-32 md:w-40" icon="i-lucide-search" />
					<SharedUnsavedChangesModal :config-ref="hostConfigTabsRef" size="xs" @save-all="saveAll"
						@discard-all="discardAll" />
					<UTooltip :text="$t('refresh')">
						<UButton :icon="icons.refresh" color="primary" variant="outline" size="sm" :loading="loading"
							@click="refresh" />
					</UTooltip>
				</div>
			</div>

			<!-- Host Selector (if needed) -->
			<div v-if="showHostSelector" class="flex items-center gap-2">
				<slot name="hostSelector">
					<HostsSelector v-model="hostSelectorModel" :type="hostType" :placeholder="hostSelectorPlaceholder"
						allow-clear />
				</slot>
			</div>
		</div>

		<!-- Panel Content -->
		<div class="flex-1 min-h-0">
			<!-- Server default note when no server selected -->
			<template v-if="!resolvedHostId && activeTab === 'parameters' && hostType === 'server'">
				<div class="mb-2">
					<p class="text-xs text-muted italic">{{ $t('serverDefaultParams') }}</p>
				</div>
			</template>

			<!-- No Host Selected -->
			<div v-if="!resolvedHostId && !loading && hostType !== 'server'"
				class="p-8 text-center border border-default rounded-lg">
				<UIcon :name="hostType === 'client' ? icons.client : icons.server"
					class="w-12 h-12 mx-auto mb-3 opacity-50 text-muted" />
				<p class="text-muted">{{ hostType === 'client' ? $t('selectClientToViewConfig') :
					$t('selectServerToViewConfig') }}</p>
			</div>

			<!-- Config content -->
			<HostsConfigTabs v-else ref="hostConfigTabsRef" :host-id="resolvedHostId || null" :host-type="hostType"
				:tab="activeTab" :show-tabs="false" v-model:search="paramSearch" :show-change-banner="false"
				:panel-mode="true" @saved="handleSaved" />
		</div>
	</div>
</template>

<script setup lang="ts">
import type { HostConfigTabsRef } from '~/composables/useHostConfigPage'

interface Props {
	hostId?: string | null
	hostType?: 'client' | 'server'
	tab?: string
	panelMode?: boolean
	showHostSelector?: boolean
	hostSelectorPlaceholder?: string
	onCancelLeave?: () => void
}

const props = withDefaults(defineProps<Props>(), {
	hostId: null,
	hostType: 'client',
	tab: 'parameters',
	panelMode: false,
	showHostSelector: false,
	hostSelectorPlaceholder: undefined,
	onCancelLeave: undefined,
})

const emit = defineEmits<{
	'update:hostId': [value: string | null]
	'update:tab': [value: string]
	saved: []
}>()

const icons = useIcons()
const { t: $t } = useI18n()

// Host selector model for when using internal host selection
const hostSelectorModel = ref<string>(props.hostId || '')
watch(() => props.hostId, (v) => { hostSelectorModel.value = v || '' })
watch(hostSelectorModel, (v) => emit('update:hostId', v || null))

// Resolved host ID (either from prop or selector)
const resolvedHostId = computed(() => props.hostId || (props.showHostSelector ? hostSelectorModel.value : null))

// Tab management
const activeTab = ref(props.tab)
watch(() => props.tab, (v) => { if (v) activeTab.value = v })
watch(activeTab, (v) => emit('update:tab', v))

// Use host config page composable
const {
	loading,
	paramSearch,
	configTabs,
	hostConfigTabsRef,
	refresh,
	saveAll,
	discardAll,
	handleSaved,
	showLeaveWarning,
	confirmLeave,
	cancelLeave,
} = useHostConfigPage(props.onCancelLeave)

// Forward saved event
watch(() => handleSaved, () => emit('saved'), { flush: 'post' })

// Expose ref for parent components
defineExpose({
	hostConfigTabsRef: hostConfigTabsRef as Ref<HostConfigTabsRef | null>,
	refresh,
	saveAll,
	discardAll,
	hasAnyChanges: computed(() => hostConfigTabsRef.value?.hasAnyChanges || false),
})
</script>