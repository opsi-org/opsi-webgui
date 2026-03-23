HostsParametersTreeForm - Parameters tree form with proper type handling.
Supports: BoolConfig (checkbox), UnicodeConfig (select/input/multivalue/password).
Password detection for configIds containing 'password', 'secret', 'key' patterns.
Multivalue with tag-like editing and add-new-value for editable params.
<template>
	<UList>
		<UListItem v-for="node in tree" :key="node.key" class="mb-1 relative" :class="{
			'opsi-main-category': getDepth(node.key) === 0
		}">
			<!-- Tree guide lines for nested items -->
			<span v-for="i in getDepth(node.key)" :key="i" class="tree-guide-line"
				:style="{ left: `${(i - 1) * 25 + 12}px` }" />
			<template v-if="node.children">
				<div class="tree-node select-none opsi-tree-row" :class="{ 'tree-node-open': open[node.key] }"
					@click="toggle(node.key)">
					<div class="opsi-tree-col opsi-tree-label-col">
						<span class="opsi-tree-indent" :style="{ width: `${getDepth(node.key) * 25}px` }"></span>
						<UButton icon="i-heroicons-chevron-down" size="xs" variant="ghost" color="neutral"
							class="shrink-0 transition-transform duration-200"
							:class="{ '-rotate-90': !open[node.key] }" tabindex="-1" @click.stop="toggle(node.key)" />
						<span class="opsi-tree-label transition-colors font-mono">
							{{ node.label }}
						</span>
						<span class="text-xs text-(--color-text-muted) ml-2"
							v-if="node.children && getDepth(node.key) > 0">
							({{ countLeafParams(node.children) }})
						</span>
					</div>
					<div class="opsi-tree-col opsi-tree-value-col"></div>
				</div>
			</template>
			<template v-else-if="node.param">
				<div class="form-row rounded transition-colors opsi-tree-row"
					:class="changedParams.has(node.param.configId) ? 'bg-yellow-50 dark:bg-yellow-700/10' : ''">
					<div class="opsi-tree-col opsi-tree-label-col" :title="node.param.configId">
						<span class="opsi-tree-indent" :style="{ width: `${getDepth(node.key) * 30}px` }"></span>
						<span class="opsi-tree-label min-w-0 break-all">
							<span
								class="font-mono text-sm text-(--color-text-secondary) dark:text-(--color-text-secondary) truncate">{{
									node.param.configId }}</span>
							<UTooltip v-if="node.param.description" :text="node.param.description">
								<UButton size="xs" icon="i-lucide-info" variant="ghost" color="neutral"
									class="shrink-0 opacity-60 hover:opacity-100" tabindex="-1" />
							</UTooltip>
							<!-- Type badges -->
							<span v-if="!node.param.editable"
								class="inline-flex items-center text-[10px] text-(--color-text-muted) ml-1 opacity-60"
								:title="$t('readOnlyParam')">
								<UIcon name="i-heroicons-lock-closed" class="w-3 h-3" />
							</span>
							<span v-if="changedParams.has(node.param.configId)"
								class="inline-flex items-center gap-1 text-[10px] text-yellow-700 dark:text-yellow-200 ml-1">
								<UIcon name="i-heroicons-pencil-square" class="w-3 h-3" />
							</span>
						</span>
					</div>
					<div class="opsi-tree-col opsi-tree-value-col"
						:style="{ '--mobile-indent': `${getDepth(node.key) * 25}px` }">
						<div class="opsi-tree-controls">
							<SharedPropertyFormItem :model-value="currentValue(node.param)"
								:type="node.param.type === 'BoolConfig' ? 'bool' : 'unicode'"
								:possible-values="node.param.possibleValues || []" :multi-value="node.param.multiValue"
								:editable="node.param.editable" :disabled="readonly || !node.param.editable"
								:password="isPasswordParam(node.param.configId)"
								@update:model-value="(v: unknown) => node.param && setParam(node.param, v)" />

							<!-- Discard button -->
							<UButton v-if="changedParams.has(node.param.configId)" size="xs" variant="ghost"
								color="neutral" :icon="icons.close" :title="$t('discardItem')"
								@click="() => node.param && discardSingleParam(node.param.configId)" />
						</div>
					</div>
				</div>
			</template>
			<HostsParametersTreeForm v-if="node.children && open[node.key]" :tree="node.children" v-bind="passProps" />
		</UListItem>
	</UList>
</template>

<script setup lang="ts">
import { ref, computed, toRefs, watch } from 'vue'

interface Param {
	configId: string
	type: 'BoolConfig' | 'UnicodeConfig'
	description?: string
	defaultValues: unknown[]
	possibleValues: unknown[]
	multiValue: boolean
	editable: boolean
	objects: Record<string, unknown>
}
interface TreeNode {
	key: string
	label: string
	param?: Param
	children?: TreeNode[]
}

const props = defineProps<{
	params?: Param[]
	tree?: TreeNode[]
	changedParams: Map<string, unknown>
	readonly: boolean
	currentValue: (p: Param) => unknown
	setParam: (p: Param, v: unknown) => void
	discardSingleParam: (id: string) => void
	icons: Record<string, string>
	fmtVal: (v: unknown) => string
	autoOpenAll?: boolean
}>()

const { t: $t } = useI18n()
const { changedParams, readonly, currentValue, setParam, discardSingleParam, icons, fmtVal } = toRefs(props)
const passProps = computed(() => ({
	changedParams: changedParams.value,
	readonly: readonly.value,
	currentValue: currentValue.value,
	setParam: setParam.value,
	discardSingleParam: discardSingleParam.value,
	icons: icons.value,
	fmtVal: fmtVal.value,
}))

// Password detection patterns
const PASSWORD_PATTERNS = /password|passwd|secret|\.key$|opsiHostKey|oneTimePassword/i

function isPasswordParam(configId: string): boolean {
	return PASSWORD_PATTERNS.test(configId)
}

function asArray(val: unknown): string[] {
	if (Array.isArray(val)) return val.map(String)
	if (val === null || val === undefined || val === '') return []
	return [String(val)]
}

function countLeafParams(nodes: TreeNode[]): number {
	let count = 0
	for (const node of nodes) {
		if (node.param) count++
		else if (node.children) count += countLeafParams(node.children)
	}
	return count
}

function buildTree(params: Param[]): TreeNode[] {
	const root: Record<string, any> = {}
	for (const p of params) {
		const parts = p.configId.split('.')
		let node = root
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i]
			if (!part) continue
			if (i === parts.length - 1) {
				node[part] = { __param: p }
			} else {
				node[part] = node[part] || {}
				node = node[part]
			}
		}
	}
	function toTree(obj: Record<string, any>, prefix = ''): TreeNode[] {
		return Object.entries(obj).map(([key, value]) => {
			if (value && typeof value === 'object' && '__param' in value) {
				return { key: prefix + key, label: key, param: value.__param }
			} else {
				return {
					key: prefix + key,
					label: key,
					children: toTree(value, prefix + key + '.'),
				}
			}
		})
	}
	return toTree(root)
}

const open = ref<Record<string, boolean>>({})
if (typeof window !== 'undefined') {
	open.value['general'] = true
}
const tree = computed<TreeNode[]>(() => props.tree ?? (props.params ? buildTree(props.params) : []))

function getDepth(key: string): number {
	return key.split('.').length - 1
}

function toggle(key: string) {
	if (props.autoOpenAll) {
		open.value[key] = !open.value[key]
		return
	}
	const depth = getDepth(key)
	if (depth === 0) {
		for (const k in open.value) {
			if (getDepth(k) === 0 && k !== key) {
				open.value[k] = false
			}
		}
		open.value[key] = !open.value[key]
	} else {
		open.value[key] = !open.value[key]
	}
}

watch(
	() => props.autoOpenAll,
	(val) => {
		if (val) {
			function openAll(nodes: TreeNode[]) {
				for (const node of nodes) {
					open.value[node.key] = true
					if (node.children) openAll(node.children)
				}
			}
			openAll(tree.value)
		} else {
			const mainCategories = tree.value.filter(n => getDepth(n.key) === 0)
			for (const node of mainCategories) {
				open.value[node.key] = false
			}
			const firstCategory = mainCategories[0]
			if (firstCategory) open.value[firstCategory.key] = true
		}
	}
)
</script>

<style scoped>
.opsi-tree-row {
	display: flex;
	width: 100%;
}

.opsi-tree-label-col,
.opsi-tree-value-col {
	flex: 1 1 0;
	max-width: 50%;
	box-sizing: border-box;
	display: flex;
	align-items: center;
}

.opsi-tree-indent {
	display: inline-block;
	height: 1.5em;
}

.opsi-tree-controls {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	width: 100%;
}

.opsi-tree-label {
	display: inline-block;
	width: 100%;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	vertical-align: middle;
}

.opsi-main-category>.tree-node,
.opsi-main-category>.form-row {
	border-left: 4px solid var(--color-border);
	padding-left: 8px;
}

/* Tree connector guide lines */
.tree-guide-line {
	position: absolute;
	top: 0;
	bottom: 0;
	width: 1px;
	background-color: var(--color-border);
	opacity: 0.3;
	pointer-events: none;
}

@media (max-width: 700px) {
	.opsi-tree-row {
		flex-direction: column;
	}

	.opsi-tree-label-col,
	.opsi-tree-value-col {
		max-width: 100%;
		width: 100%;
	}

	.opsi-tree-controls {
		flex-wrap: wrap;
	}

	.opsi-tree-value-col {
		margin-left: var(--mobile-indent, 0px);
	}
}

.tree-node:hover {
	background-color: var(--color-surface-hover, #4b4b49);
	cursor: pointer;
	transition: background 0.2s;
}
</style>