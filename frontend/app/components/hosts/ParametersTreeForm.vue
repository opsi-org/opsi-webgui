HostsParametersTreeForm - Parameters tree form with groups-style tree connectors.
Supports: BoolConfig (checkbox), UnicodeConfig (select/input/multivalue/password).
Password detection for configIds containing 'password', 'secret', 'key' patterns.
Multivalue with tag-like editing and add-new-value for editable params.
<template>
	<div class="params-tree">
		<div v-for="node in tree" :key="node.key" class="param-tree-node"
			:class="{ 'param-tree-node-root': getDepth(node.key) === 0 }">
			<!-- Category node -->
			<template v-if="node.children">
				<div :class="[
					'flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-colors group/node',
					'hover:bg-(--color-surface-hover)',
				]" :style="{ paddingLeft: `${8 + getDepth(node.key) * 16}px` }" @click="toggle(node.key)">
					<span v-for="i in getDepth(node.key)" :key="i" class="tree-guide-line"
						:style="{ left: `${8 + (i - 1) * 16}px` }" />
					<button type="button"
						class="w-5 h-5 flex items-center justify-center rounded transition-all shrink-0" :class="open[node.key]
							? 'text-(--color-primary) bg-primary/10'
							: 'text-(--color-text-muted) hover:text-(--color-text) hover:bg-(--color-surface-hover)'"
						@click.stop="toggle(node.key)">
						<UIcon :name="icons.arrowRight" class="w-3.5 h-3.5 transition-transform duration-200"
							:class="{ 'rotate-90': open[node.key] }" />
					</button>
					<span class="text-sm font-mono flex-1 truncate transition-colors"
						:class="open[node.key] ? 'font-medium' : ''">
						{{ node.label }}
					</span>
					<span class="text-xs text-(--color-text-muted) opacity-60">{{ countLeaves(node) }}</span>
				</div>
				<div v-if="mounted[node.key]" v-show="open[node.key]" class="children-container">
					<HostsParametersTreeForm :tree="node.children" v-bind="passProps" />
				</div>
			</template>

			<template v-else-if="node.param">
				<div :class="[
					'flex items-start gap-1.5 px-2 py-1.5 rounded transition-colors',
					changedParams.has(node.param.configId) ? 'bg-yellow-50 dark:bg-yellow-700/10' : 'hover:bg-(--color-surface-hover)',
				]" :style="{ paddingLeft: `${8 + getDepth(node.key) * 16}px` }">
					<span v-for="i in getDepth(node.key)" :key="i" class="tree-guide-line"
						:style="{ left: `${8 + (i - 1) * 16}px` }" />
					<span class="w-5 flex items-center justify-center shrink-0 mt-1" />
					<div class="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
						<div class="min-w-0 md:w-2/5 flex items-center gap-1">
							<span class="font-mono text-sm text-(--color-text-secondary) truncate"
								:title="node.param.configId">
								{{ node.param.configId }}
							</span>
							<UTooltip v-if="node.param.description" :text="node.param.description">
								<UButton size="xs" :icon="icons.info" variant="ghost" color="neutral"
									class="shrink-0 opacity-60 hover:opacity-100" tabindex="-1" />
							</UTooltip>
							<span v-if="changedParams.has(node.param.configId)"
								class="inline-flex items-center text-[10px] text-yellow-700 dark:text-yellow-200 ml-0.5">
								<UIcon :name="icons.modify" class="w-3 h-3" />
							</span>
						</div>
						<div class="flex-1 flex items-center gap-2 min-w-0">
							<SharedPropertyFormItem :model-value="currentValue(node.param)"
								:type="node.param.type === 'BoolConfig' ? 'bool' : 'unicode'"
								:possible-values="node.param.possibleValues || []" :multi-value="node.param.multiValue"
								:editable="node.param.editable" :disabled="false"
								:password="isPasswordParam(node.param.configId)"
								@update:model-value="(v: unknown) => node.param && setParam(node.param, v)" />
							<UButton v-if="changedParams.has(node.param.configId)" size="xs" variant="ghost"
								color="neutral" :icon="icons.close" :title="$t('discardItem')"
								@click="() => node.param && discardSingleParam(node.param.configId)" />
						</div>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, toRefs, watch } from 'vue'

interface Param {
	configId: string
	type: 'BoolConfig' | 'UnicodeConfig'
	description?: string
	defaultValues?: unknown[]
	possibleValues: unknown[]
	multiValue: boolean
	editable: boolean
	objects?: Record<string, unknown>
	value?: unknown
	newValue?: string
	newValues?: unknown[]
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

const PASSWORD_PATTERNS = /password|passwd|secret|\.key$|opsiHostKey|oneTimePassword/i

function isPasswordParam(configId: string): boolean {
	return PASSWORD_PATTERNS.test(configId)
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
const mounted = ref<Record<string, boolean>>({})
if (typeof window !== 'undefined') {
	open.value['general'] = true
	mounted.value['general'] = true
}
const tree = computed<TreeNode[]>(() => props.tree ?? (props.params ? buildTree(props.params) : []))

function countLeaves(node: TreeNode): number {
	if (node.param) return 1
	if (!node.children) return 0
	let count = 0
	for (const child of node.children) count += countLeaves(child)
	return count
}

function getDepth(key: string): number {
	return key.split('.').length - 1
}

function toggle(key: string) {
	open.value[key] = !open.value[key]
	if (open.value[key] && !mounted.value[key]) {
		mounted.value[key] = true
	}
}

watch(
	() => props.autoOpenAll,
	(val) => {
		if (val) {
			function openAll(nodes: TreeNode[]) {
				for (const node of nodes) {
					open.value[node.key] = true
					mounted.value[node.key] = true
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
.params-tree {
	user-select: none;
}

.param-tree-node {
	position: relative;
}

.children-container {
	position: relative;
}

/* Tree connector guide lines */
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