SystemInfo - Component to display system diagnostic information in a tree view (like host parameters)

<template>
	<div class="system-info-tree">
		<div v-if="loading" class="py-8 text-center">
			<SharedLoadingSpinner />
		</div>
		<template v-else>
			<!-- System properties node -->
			<div v-if="Object.keys(filteredSystemInfo).length > 0" class="tree-node">
				<div class="flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-colors hover:bg-(--color-surface-hover)"
					@click="toggleNode('_system')">
					<button type="button"
						class="w-5 h-5 flex items-center justify-center rounded transition-all shrink-0"
						:class="expanded['_system'] ? 'text-(--color-primary) bg-primary/10' : 'text-(--color-text-muted) hover:text-(--color-text) hover:bg-(--color-surface-hover)'"
						@click.stop="toggleNode('_system')">
						<UIcon :name="icons.chevronRight" class="w-3.5 h-3.5 transition-transform duration-200"
							:class="{ 'rotate-90': expanded['_system'] }" />
					</button>
					<span class="text-sm font-mono flex-1 truncate" :class="expanded['_system'] ? 'font-medium' : ''">
						{{ $t('systemProperties') }}
					</span>
					<span class="text-xs text-(--color-text-muted) opacity-60">{{ Object.keys(filteredSystemInfo).length }}</span>
				</div>
				<div v-if="expanded['_system']" class="children-container">
					<div v-for="(value, key) in filteredSystemInfo" :key="key" class="tree-node">
						<div class="flex items-start gap-1.5 px-2 py-1.5 rounded transition-colors hover:bg-(--color-surface-hover) group/leaf"
							style="padding-left: 24px;">
							<span class="tree-guide-line" style="left: 8px;" />
							<span class="w-5 flex items-center justify-center shrink-0 mt-0.5" />
							<div class="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
								<span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-2/5 break-all truncate"
									:title="String(key)">
									{{ key }}
								</span>
								<div class="flex items-center gap-2 flex-1 min-w-0">
									<UBadge v-if="typeof value === 'boolean'" :color="value ? 'success' : 'neutral'" variant="soft" size="xs">
										{{ value ? 'Yes' : 'No' }}
									</UBadge>
									<span v-else class="font-mono text-sm font-medium truncate" :title="String(value)">
										{{ formatValue(value) }}
									</span>
									<UButton color="primary" variant="soft" size="xs" :icon="icons.copy"
										class="opacity-0 group-hover/leaf:opacity-100 transition-opacity shrink-0"
										@click.stop="$emit('copyToClipboard', String(value))" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Category nodes -->
			<template v-for="(values, category) in filteredDiagnosticsData" :key="category">
				<div v-if="typeof values === 'object' && values !== null && Object.keys(values as object).length > 0"
					class="tree-node">
					<div class="flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-colors hover:bg-(--color-surface-hover)"
						@click="toggleNode(String(category))">
						<button type="button"
							class="w-5 h-5 flex items-center justify-center rounded transition-all shrink-0"
							:class="expanded[String(category)] ? 'text-(--color-primary) bg-primary/10' : 'text-(--color-text-muted) hover:text-(--color-text) hover:bg-(--color-surface-hover)'"
							@click.stop="toggleNode(String(category))">
							<UIcon :name="icons.chevronRight" class="w-3.5 h-3.5 transition-transform duration-200"
								:class="{ 'rotate-90': expanded[String(category)] }" />
						</button>
						<span class="text-sm font-mono flex-1 truncate" :class="expanded[String(category)] ? 'font-medium' : ''">
							{{ String(category) }}
						</span>
						<span class="text-xs text-(--color-text-muted) opacity-60">{{ Object.keys(values as object).length }}</span>
					</div>
					<div v-if="expanded[String(category)]" class="children-container">
						<template v-for="(v, k) in (values as Record<string, unknown>)" :key="k">
							<!-- Nested object child -->
							<div v-if="isComplexValue(v)" class="tree-node">
								<div class="flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-colors hover:bg-(--color-surface-hover)"
									style="padding-left: 24px;"
									@click="toggleNode(String(category) + '.' + String(k))">
									<span class="tree-guide-line" style="left: 8px;" />
									<button type="button"
										class="w-5 h-5 flex items-center justify-center rounded transition-all shrink-0"
										:class="expanded[String(category) + '.' + String(k)] ? 'text-(--color-primary) bg-primary/10' : 'text-(--color-text-muted)'"
										@click.stop="toggleNode(String(category) + '.' + String(k))">
										<UIcon :name="icons.chevronRight" class="w-3.5 h-3.5 transition-transform duration-200"
											:class="{ 'rotate-90': expanded[String(category) + '.' + String(k)] }" />
									</button>
									<span class="text-sm font-mono flex-1 truncate"
										:class="expanded[String(category) + '.' + String(k)] ? 'font-medium' : ''">
										{{ k }}
									</span>
									<span class="text-xs text-(--color-text-muted) opacity-60">
										{{ typeof v === 'object' && v !== null ? Object.keys(v as object).length : '' }}
									</span>
								</div>
								<div v-if="expanded[String(category) + '.' + String(k)]" class="children-container">
									<template v-if="Array.isArray(v)">
										<div v-for="(item, idx) in v" :key="idx" class="tree-node">
											<div class="flex items-start gap-1.5 px-2 py-1 rounded transition-colors hover:bg-(--color-surface-hover)"
												style="padding-left: 40px;">
												<span class="tree-guide-line" style="left: 8px;" />
												<span class="tree-guide-line" style="left: 24px;" />
												<span class="w-5 flex items-center justify-center shrink-0 mt-0.5" />
												<span class="font-mono text-sm break-all">{{ typeof item === 'object' ? JSON.stringify(item) : String(item) }}</span>
											</div>
										</div>
									</template>
									<template v-else-if="typeof v === 'object' && v !== null">
										<div v-for="(sv, sk) in (v as Record<string, unknown>)" :key="sk" class="tree-node">
											<div class="flex items-start gap-1.5 px-2 py-1.5 rounded transition-colors hover:bg-(--color-surface-hover) group/deep"
												style="padding-left: 40px;">
												<span class="tree-guide-line" style="left: 8px;" />
												<span class="tree-guide-line" style="left: 24px;" />
												<span class="w-5 flex items-center justify-center shrink-0 mt-0.5" />
												<div class="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
													<span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-2/5 break-all truncate"
														:title="String(sk)">
														{{ sk }}
													</span>
													<div class="flex items-center gap-2 flex-1 min-w-0">
														<UBadge v-if="typeof sv === 'boolean'" :color="sv ? 'success' : 'neutral'" variant="soft" size="xs">
															{{ sv ? 'Yes' : 'No' }}
														</UBadge>
														<span v-else-if="typeof sv === 'object'" class="font-mono text-xs break-all truncate max-w-full"
															:title="JSON.stringify(sv)">
															{{ JSON.stringify(sv) }}
														</span>
														<span v-else class="font-mono text-sm font-medium truncate" :title="String(sv)">
															{{ formatValue(sv) }}
														</span>
														<UButton color="primary" variant="soft" size="xs" :icon="icons.copy"
															class="opacity-0 group-hover/deep:opacity-100 transition-opacity shrink-0"
															@click.stop="$emit('copyToClipboard', typeof sv === 'object' ? JSON.stringify(sv, null, 2) : String(sv))" />
													</div>
												</div>
											</div>
										</div>
									</template>
								</div>
							</div>
							<!-- Simple leaf child -->
							<div v-else class="tree-node">
								<div class="flex items-start gap-1.5 px-2 py-1.5 rounded transition-colors hover:bg-(--color-surface-hover) group/leaf"
									style="padding-left: 24px;">
									<span class="tree-guide-line" style="left: 8px;" />
									<span class="w-5 flex items-center justify-center shrink-0 mt-0.5" />
									<div class="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
										<span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-2/5 break-all truncate"
											:title="String(k)">
											{{ k }}
										</span>
										<div class="flex items-center gap-2 flex-1 min-w-0">
											<UBadge v-if="typeof v === 'boolean'" :color="v ? 'success' : 'neutral'" variant="soft" size="xs">
												{{ v ? 'Yes' : 'No' }}
											</UBadge>
											<span v-else class="font-mono text-sm font-medium truncate" :title="String(v)">
												{{ formatValue(v) }}
											</span>
											<UButton color="primary" variant="soft" size="xs" :icon="icons.copy"
												class="opacity-0 group-hover/leaf:opacity-100 transition-opacity shrink-0"
												@click.stop="$emit('copyToClipboard', typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v))" />
										</div>
									</div>
								</div>
							</div>
						</template>
					</div>
				</div>
			</template>

			<div v-if="Object.keys(filteredSystemInfo).length === 0 && Object.keys(filteredDiagnosticsData).length === 0"
				class="text-center py-8 text-gray-500">
				{{ filter ? $t('noResultsFound') : $t('noDataAvailable') }}
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
const { t: $t } = useI18n()
const props = defineProps([
	'filteredSystemInfo', 'filteredDiagnosticsData', 'loading', 'icons', 'filter', 'formatKey', 'formatValue'
])
defineEmits(['copyToClipboard'])

const expanded = ref<Record<string, boolean>>({})

function toggleNode(key: string) {
	expanded.value[key] = !expanded.value[key]
}

function isComplexValue(value: unknown): boolean {
	if (value === null || value === undefined) return false
	if (typeof value !== 'object') return false
	if (Array.isArray(value)) return true
	return Object.keys(value as object).length > 0
}
</script>

<style scoped>
.system-info-tree {
	user-select: none;
}

.tree-node {
	position: relative;
}

.children-container {
	position: relative;
}

.tree-guide-line {
	position: absolute;
	top: 0;
	bottom: 0;
	width: 1px;
	background-color: var(--color-border);
	opacity: 0.4;
	pointer-events: none;
}
</style>

<style scoped>
.system-tree-node {
	position: relative;
	user-select: none;
}
</style>