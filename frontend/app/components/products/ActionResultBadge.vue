<template>
	<div class="flex justify-center">
		<SharedTooltipTable v-if="isMixed" :rows="mixedTooltipRows">
			<UBadge color="warning" variant="subtle" size="xs" class="gap-1 cursor-help">
				<UIcon :name="icons.unequal" class="w-3 h-3" />
				<span>{{ $t('mixed') }}</span>
			</UBadge>
		</SharedTooltipTable>

		<template v-else-if="normalizedResult === 'successful'">
			<UBadge color="success" variant="subtle" size="xs" class="gap-1">
				<UIcon :name="icons.checkCircle" class="w-3 h-3" />
				<span>{{ $t('successful') }}</span>
			</UBadge>
		</template>

		<template v-else-if="normalizedResult === 'failed'">
			<UBadge color="error" variant="subtle" size="xs" class="gap-1">
				<UIcon :name="icons.xCircle" class="w-3 h-3" />
				<span>{{ $t('failed') }}</span>
			</UBadge>
		</template>

		<span v-else-if="normalizedResult === 'none' || !normalizedResult"
			class="text-(--color-text-muted) text-xs">-</span>

		<UBadge v-else color="neutral" variant="subtle" size="xs">
			{{ result }}
		</UBadge>
	</div>
</template>

<script setup lang="ts">
interface Props {
	result?: string
	resultDetails?: string[]
	selectedClients?: string[] | null
}

const props = defineProps<Props>()

const icons = useIcons()
const { t: $t } = useI18n()

const normalizedResult = computed(() => props.result?.toLowerCase())

const isMixed = computed(() => {
	if (normalizedResult.value === 'mixed') return true
	if (!props.resultDetails || props.resultDetails.length <= 1) return false
	const uniqueResults = [...new Set(props.resultDetails.map(r => (r || 'none').toLowerCase()))]
	return uniqueResults.length > 1
})

const mixedTooltipRows = computed(() => {
	if (!props.resultDetails) return []
	const clients = props.selectedClients || []
	if (clients.length > 0 && clients.length === props.resultDetails.length) {
		return clients.map((c, i) => {
			const result = (props.resultDetails![i] || 'none').toLowerCase()
			return {
				key: c,
				value: props.resultDetails![i] || 'none',
				badge: result === 'none' ? undefined : result,
				badgeColor: result === 'successful' ? 'success' : result === 'failed' ? 'error' : undefined,
			}
		})
	}
	const counts: Record<string, number> = {}
	props.resultDetails.forEach(r => {
		const key = r?.toLowerCase() || 'none'
		counts[key] = (counts[key] || 0) + 1
	})
	return Object.entries(counts).map(([k, v]) => ({
		key: k,
		value: String(v),
		badge: k === 'none' ? undefined : k,
		badgeColor: k === 'successful' ? 'success' : k === 'failed' ? 'error' : undefined,
	}))
})
</script>
