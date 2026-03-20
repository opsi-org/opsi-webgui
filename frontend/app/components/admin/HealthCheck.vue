HealthCheck - Component to display health check results
<template>
	<UCard>
		<template #header>
			<div class="flex items-center justify-between">
				<span class="font-medium">{{ $t('healthCheck') }}</span>
				<span class="text-xs text-gray-500">{{ filteredHealthData.length }} {{ $t('checks') }}</span>
			</div>
		</template>
		<div v-if="loading" class="py-8 text-center">
			<UIcon :name="icons.loading" class="w-6 h-6 animate-spin text-gray-400" />
		</div>
		<div v-else class="space-y-2">
			<div v-for="item in filteredHealthData" :key="item.key" class="rounded-lgoverflow-hidden">
				<div class="flex items-start gap-3 p-3 cursor-pointer transition-colors"
					@click="$emit('toggleExpand', item.key)">
					<UIcon v-if="item.children && item.children.length > 0"
						:name="expanded[item.key] ? icons.arrowDown : icons.arrowRight"
						class="w-4 h-4 mt-0.5 shrink-0 text-gray-500" />
					<div v-else class="w-4" />
					<SharedStatusBadge :status="getStatusType(item.status)" :label="item.status" class="shrink-0" />
					<div class="flex-1 min-w-0">
						<div class="font-medium text-sm" :title="item.description">{{ item.name }}</div>
						<div v-if="item.message" class="text-xs text-gray-600 dark:text-gray-400 mt-0.5 break-all">
							{{ item.message }}
						</div>
					</div>
				</div>
				<div v-if="item.children && item.children.length > 0 && expanded[item.key]"
					class="border-l border-(--color-border)">
					<div v-for="child in item.children" :key="child.key" class="flex items-start gap-3 p-3 pl-10">
						<SharedStatusBadge :status="getStatusType(child.status)" :label="child.status"
							class="shrink-0" />
						<div class="flex-1 min-w-0">
							<div class="font-medium text-sm">{{ child.name }}</div>
							<div v-if="child.message" class="text-xs text-gray-600 dark:text-gray-400 mt-0.5 break-all">
								{{ child.message }}
							</div>
						</div>
					</div>
				</div>
			</div>
			<div v-if="filteredHealthData.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
				{{ $t('noResultsFound') }}
			</div>
		</div>
	</UCard>
</template>

<script setup lang="ts">
const { t: $t } = useI18n()
defineProps([
	'filteredHealthData', 'loading', 'stats', 'statusFilter', 'icons', 'expanded', 'getStatusType'
])
defineEmits(['toggleExpand', 'filterByStatus', 'clearStatusFilter'])
</script>