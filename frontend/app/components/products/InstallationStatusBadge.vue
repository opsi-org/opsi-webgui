<template>
	<div class="flex justify-center">
		<SharedTooltipTable v-if="isMixed" :rows="mixedTooltipRows">
			<UBadge color="warning" variant="subtle" size="xs" class="gap-1 cursor-help">
				<UIcon :name="icons.unequal" class="w-3 h-3" />
				<span>{{ $t('mixed') }}</span>
			</UBadge>
		</SharedTooltipTable>

		<template v-else-if="normalizedStatus === 'installed'">
			<UBadge color="success" variant="subtle" size="xs" class="gap-1">
				<UIcon :name="icons.checkCircle" class="w-3 h-3" />
				<span>{{ $t('installed') }}</span>
			</UBadge>
		</template>

		<template v-else-if="normalizedStatus === 'unknown'">
			<UBadge color="warning" variant="subtle" size="xs" class="gap-1">
				<UIcon :name="icons.productInstallationStatusUnknown" class="w-3 h-3" />
				<span>{{ $t('unknown') }}</span>
			</UBadge>
		</template>

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
	selectedClients?: string[] | null
}

const props = defineProps<Props>()

const icons = useIcons()
const { t: $t } = useI18n()

const normalizedStatus = computed(() => props.status?.toLowerCase())

const isMixed = computed(() => {
	if (normalizedStatus.value === 'mixed') return true
	if (!props.statusDetails || props.statusDetails.length <= 1) return false
	const uniqueStatuses = [...new Set(props.statusDetails.map(s => (s || 'none').toLowerCase()))]
	return uniqueStatuses.length > 1
})

const mixedTooltipRows = computed(() => {
	if (!props.statusDetails) return []
	const clients = props.selectedClients || []
	if (clients.length > 0 && clients.length === props.statusDetails.length) {
		return clients.map((c, i) => {
			const status = (props.statusDetails![i] || 'none').toLowerCase()
			return {
				key: c,
				value: props.statusDetails![i] || 'none',
				badge: status === 'not_installed' || status === 'none' ? undefined : status,
				badgeColor: status === 'installed' ? 'success' : status === 'unknown' ? 'warning' : undefined,
			}
		})
	}
	const counts: Record<string, number> = {}
	props.statusDetails.forEach(s => {
		const key = s?.toLowerCase() || 'none'
		counts[key] = (counts[key] || 0) + 1
	})
	return Object.entries(counts).map(([k, v]) => ({
		key: k,
		value: String(v),
		badge: k === 'not_installed' || k === 'none' ? undefined : k,
		badgeColor: k === 'installed' ? 'success' : k === 'unknown' ? 'warning' : undefined,
	}))
})
</script>
