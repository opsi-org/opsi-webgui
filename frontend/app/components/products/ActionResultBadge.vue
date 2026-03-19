<template>
	<div class="flex justify-center">
		<UTooltip v-if="isMixed" :text="mixedTooltip">
			<UBadge color="warning" variant="subtle" size="xs">
				<UIcon :name="icons.unequal" class="w-3 h-3" />
			</UBadge>
		</UTooltip>

		<UTooltip v-else-if="normalizedResult === 'successful'" :text="$t('successful')">
			<UBadge color="success" variant="subtle" size="xs">
				<UIcon :name="icons.productActionResultSuccessful" class="w-3 h-3" />
			</UBadge>
		</UTooltip>

		<UTooltip v-else-if="normalizedResult === 'failed'" :text="$t('failed')">
			<UBadge color="error" variant="subtle" size="xs">
				<UIcon :name="icons.productsFailedActionResult" class="w-3 h-3" />
			</UBadge>
		</UTooltip>

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
}

const props = defineProps<Props>()

const icons = useIcons()
const { t: $t } = useI18n()

const normalizedResult = computed(() => props.result?.toLowerCase())

const isMixed = computed(() => {
	if (!props.resultDetails || props.resultDetails.length <= 1) return false
	const uniqueResults = [...new Set(props.resultDetails.map(r => r?.toLowerCase()))]
	return uniqueResults.length > 1
})

const mixedTooltip = computed(() => {
	if (!props.resultDetails) return String($t('mixed'))
	const counts: Record<string, number> = {}
	props.resultDetails.forEach(r => {
		const key = r?.toLowerCase() || 'none'
		counts[key] = (counts[key] || 0) + 1
	})
	return Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(', ')
})
</script>
