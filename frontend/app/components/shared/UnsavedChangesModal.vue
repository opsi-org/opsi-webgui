<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

SharedUnsavedChangesModal — Reusable unsaved-changes button + popup.
-->
<template>
	<!-- Trigger button (only shown when there are changes) -->
	<template v-if="configRef?.hasAnyChanges">
		<UButton :size="size" color="warning" variant="outline" @click="open = true">
			{{ $t('unsavedChanges') }}
			<UBadge :size="size === 'xs' ? 'xs' : 'xs'" color="warning" class="ml-1">
				{{ configRef?.changedCount }}
			</UBadge>
		</UButton>
		<template v-if="showSaveDiscard">
			<UTooltip :text="$t('saveChanges')">
				<UButton :size="size" color="success" icon="i-lucide-check" :loading="configRef?.isSaving"
					@click="$emit('saveAll')" />
			</UTooltip>
		</template>
	</template>

	<!-- Changes popup modal -->
	<UModal v-model:open="open" :title="$t('unsavedChanges')" :ui="{ content: 'max-w-2xl' }">
		<template #body>
			<div class="space-y-4">
				<!-- Changed parameters -->
				<div v-if="(configRef?.changedParams?.size ?? 0) > 0">
					<p class="text-xs font-semibold text-muted uppercase mb-2">{{ $t('parameters') }}</p>
					<div class="divide-y divide-default border border-default rounded-lg">
						<div v-for="[key] in configRef?.changedParams" :key="key"
							class="changed-item flex items-center justify-between gap-2 px-3 py-2 text-sm">
							<div class="min-w-0">
								<p class="font-mono text-xs truncate">{{ key }}</p>
								<p class="text-xs text-muted">
									{{ configRef?.fmtVal?.(configRef?.getOriginalParamValue?.(key)) }}
									→ {{ configRef?.fmtVal?.(configRef?.changedParams?.get(key)) }}
								</p>
							</div>
							<UTooltip :text="$t('discard')">
								<UButton size="xs" :icon="icons.close" color="neutral" variant="ghost"
									@click="configRef?.discardSingleParam?.(key)" />
							</UTooltip>
						</div>
					</div>
				</div>
				<!-- Changed attributes -->
				<div v-if="(configRef?.changedAttributesList?.length ?? 0) > 0">
					<p class="text-xs font-semibold text-muted uppercase mb-2">{{ $t('attributes') }}</p>
					<div class="divide-y divide-default border border-default rounded-lg">
						<div v-for="item in configRef?.changedAttributesList" :key="item.key"
							class="flex items-center justify-between gap-2 px-3 py-2 text-sm">
							<div class="min-w-0">
								<p class="font-mono text-xs truncate">{{ item.key }}</p>
								<p class="text-xs text-muted">
									{{ configRef?.fmtVal?.(item.oldValue) }}
									→ {{ configRef?.fmtVal?.(item.newValue) }}
								</p>
							</div>
							<UTooltip :text="$t('discard')">
								<UButton size="xs" :icon="icons.close" color="neutral" variant="ghost"
									@click="configRef?.discardSingleAttribute?.(item.key)" />
							</UTooltip>

						</div>
					</div>
				</div>
			</div>
		</template>
		<template #footer>
			<div class="w-full flex gap-2 justify-end">
				<UButton variant="outline" color="neutral" @click="handleDiscardAll">{{ $t('discardAll') }}</UButton>
				<UButton color="primary" @click="handleSaveAll">{{ $t('saveAll') }}</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
interface HostConfigRef {
	hasAnyChanges?: boolean
	isSaving?: boolean
	changedCount?: number
	changedParams?: Map<string, unknown>
	changedAttributesList?: Array<{ key: string; label: string; oldValue: unknown; newValue: unknown }>
	saveAll?: () => void
	discardAll?: () => void
	discardSingleParam?: (key: string) => void
	discardSingleAttribute?: (key: string) => void
	getOriginalParamValue?: (key: string) => unknown
	fmtVal?: (v: unknown) => string
}

const props = withDefaults(defineProps<{
	configRef: HostConfigRef | null
	size?: 'xs' | 'sm'
	showSaveDiscard?: boolean
}>(), {
	size: 'sm',
	showSaveDiscard: true,
})

defineEmits<{
	saveAll: []
	discardAll: []
}>()

const { t: $t } = useI18n()
const open = ref(false)

function handleSaveAll() {
	open.value = false
	props.configRef?.saveAll?.()
}

function handleDiscardAll() {
	open.value = false
	props.configRef?.discardAll?.()
}
</script>

<style scoped>
.changed-item:hover {
	background: var(--color-surface-hover, #4b4b49);
	transition: background 0.2s;
}
</style>