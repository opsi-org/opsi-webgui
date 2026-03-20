<template>
	<template v-if="configRef?.hasAnyChanges">
		<UButton :size="size" color="warning" variant="outline" @click="open = true">
			{{ $t('unsavedChanges') }}
			<UBadge :size="'xs'" color="warning" class="ml-1">
				{{ configRef?.changedCount }}
			</UBadge>
		</UButton>
		<template v-if="showSaveDiscard">
			<UTooltip :text="$t('saveChanges')">
				<UButton :size="size" color="success" icon="i-heroicons-check" :loading="configRef?.isSaving"
					@click="$emit('saveAll')" />
			</UTooltip>
		</template>
	</template>

	<UModal v-model:open="open" :title="$t('unsavedChanges')" :ui="{ content: 'max-w-2xl' }">
		<template #body>
			<div class="space-y-4">
				<div v-if="(configRef?.changedProperties?.size ?? 0) > 0">
					<p class="text-xs font-semibold text-muted uppercase mb-2">{{ $t('properties') }}</p>
					<div class="divide-y divide-default border border-default rounded-lg">
						<div v-for="[key] in configRef?.changedProperties" :key="key"
							class="changed-item flex items-center justify-between gap-2 px-3 py-2 text-sm">
							<div class="min-w-0">
								<p class="font-mono text-xs truncate">{{ key }}</p>
								<p class="text-xs text-muted">
									{{ configRef?.fmtVal?.(configRef?.getOriginalPropertyValue?.(key)) }}
									→ {{ configRef?.fmtVal?.(configRef?.changedProperties?.get(key)) }}
								</p>
							</div>
							<UTooltip :text="$t('discard')">
								<UButton size="xs" :icon="icons.close" color="neutral" variant="ghost"
									@click="configRef?.discardSingleProperty?.(key)" />
							</UTooltip>
						</div>
					</div>
				</div>

				<div v-if="(configRef?.changedActionRequests?.size ?? 0) > 0">
					<p class="text-xs font-semibold text-muted uppercase mb-2">{{ $t('actionRequests') }}</p>
					<div class="divide-y divide-default border border-default rounded-lg">
						<div v-for="[key, change] in configRef?.changedActionRequests" :key="key"
							class="changed-item flex items-center justify-between gap-2 px-3 py-2 text-sm">
							<div class="min-w-0">
								<p class="font-mono text-xs truncate">{{ key }}</p>
								<p class="text-xs text-muted">
									{{ change.oldRequest }} → {{ change.actionRequest }}
								</p>
							</div>
							<UTooltip :text="$t('discard')">
								<UButton size="xs" :icon="icons.close" color="neutral" variant="ghost"
									@click="configRef?.discardSingleActionRequest?.(key)" />
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
import type { ProductConfigTabsRef } from '~/types'

const props = withDefaults(defineProps<{
	configRef: ProductConfigTabsRef | null
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

const icons = useIcons()
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
