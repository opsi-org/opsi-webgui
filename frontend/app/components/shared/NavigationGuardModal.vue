<template>
	<UModal v-model:open="model" :title="$t('unsavedChanges')">
		<template #body>
			<p class="text-sm">{{ $t('navigateAwayWarning') }}</p>
		</template>
		<template #footer>
			<div class="flex gap-2 justify-end">
				<UButton variant="outline" color="neutral" @click="$emit('cancel')">{{ $t('stayOnPage') }}</UButton>
				<UButton color="error" @click="$emit('confirm')">{{ $t('leaveAnyway') }}</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
const { t: $t } = useI18n()

const model = defineModel<boolean>({ default: false })

defineEmits<{
	confirm: []
	cancel: []
}>()
</script>
