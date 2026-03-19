<template>
	<div class="flex justify-center">
		<UTooltip v-if="isMixed" :text="mixedTooltip">
			<UBadge color="warning" variant="subtle" size="xs">
				<UIcon :name="icons.unequal" class="w-3 h-3" />
			</UBadge>
		</UTooltip>

		<UTooltip v-else-if="normalizedStatus === 'installed'" :text="$t('installed')">
			<UBadge color="success" variant="subtle" size="xs">
				<UIcon :name="icons.productInstallationStatusInstalled" class="w-3 h-3" />
			</UBadge>
		</UTooltip>

		<UTooltip v-else-if="normalizedStatus === 'unknown'" :text="$t('unknown')">
			<UBadge color="warning" variant="subtle" size="xs">
				<UIcon :name="icons.productInstallationStatusUnknown" class="w-3 h-3" />
			</UBadge>
		</UTooltip>

		<span v-else-if="normalizedStatus === 'not_installed' || normalizedStatus === 'none' || !normalizedStatus"
			class="text-(--color-text-muted) text-xs">-</span>

		<UBadge v-else color="neutral" variant="subtle" size="xs">
			{{ status }}
		</UBadge>
	</div>
</template>

<script setup lang="ts">
interface Props {
	status?: string
	statusDetails?: string[]
}

const props = defineProps<Props>()

const icons = useIcons()
const { t: $t } = useI18n()

const normalizedStatus = computed(() => props.status?.toLowerCase())

const isMixed = computed(() => {
	if (!props.statusDetails || props.statusDetails.length <= 1) return false
	const uniqueStatuses = [...new Set(props.statusDetails.map(s => s?.toLowerCase()))]
	return uniqueStatuses.length > 1
})

const mixedTooltip = computed(() => {
	if (!props.statusDetails) return String($t('mixed'))
	const counts: Record<string, number> = {}
	props.statusDetails.forEach(s => {
		const key = s?.toLowerCase() || 'none'
		counts[key] = (counts[key] || 0) + 1
	})
	return Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(', ')
})
</script>
