<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

HostsParametersTreeForm - Parameters tree form.
-->
<template>
	<UList>
		<UListItem v-for="node in tree" :key="node.key" class="mb-1" :class="{
			'opsi-main-category': getDepth(node.key) === 0
		}">
			<template v-if="node.children">
				<div class="tree-node select-none opsi-tree-row" :class="{ 'tree-node-open': open[node.key] }"
					@click="toggle(node.key)">
					<div class="opsi-tree-col opsi-tree-label-col">
						<span class="opsi-tree-indent" :style="{ width: `${getDepth(node.key) * 25}px` }"></span>
						<UButton icon="i-heroicons-chevron-down" size="xs" variant="ghost" color="neutral"
							class="shrink-0 transition-transform duration-200"
							:class="{ '-rotate-90': !open[node.key] }" tabindex="-1" @click.stop="toggle(node.key)" />
						<span class="opsi-tree-label transition-colors"
							:class="{ 'font-heading': getDepth(node.key) === 0 }">
							{{ node.label }}
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
							<span class="font-mono text-sm text-(--color-text) dark:text-(--color-text) truncate">{{
								node.param.configId }}</span>
							<UButton v-if="node.param.description" size="xs" icon="i-lucide-info" variant="ghost"
								color="neutral" class="shrink-0 opacity-60 hover:opacity-100" tabindex="-1"
								:title="node.param.description" />
							<span v-if="changedParams.has(node.param.configId)"
								class="inline-flex items-center gap-1 text-[10px] text-yellow-700 dark:text-yellow-200 ml-1">
								<UIcon name="i-heroicons-pencil-square" class="w-3 h-3" />
							</span>
						</span>
					</div>
					<div class="opsi-tree-col opsi-tree-value-col"
						:style="{ '--mobile-indent': `${getDepth(node.key) * 25}px` }">
						<div class="opsi-tree-controls">
							<UCheckbox v-if="node.param.type === 'BoolConfig'"
								:model-value="Boolean(currentValue(node.param))"
								:disabled="readonly || !node.param.editable" size="sm"
								@update:model-value="(v: boolean | 'indeterminate') => node.param && setParam(node.param, v)" />
							<USelect v-else-if="node.param.possibleValues?.length && !node.param.multiValue"
								:model-value="String(currentValue(node.param))"
								:items="node.param.possibleValues.map((pv: unknown) => ({ label: String(pv), value: String(pv) }))"
								:disabled="readonly || !node.param.editable" size="sm" class="flex-1"
								@update:model-value="(v: string) => node.param && setParam(node.param, v)" />
							<UInput v-else-if="node.param.multiValue" :model-value="fmtVal(currentValue(node.param))"
								:disabled="readonly || !node.param.editable" size="sm" class="flex-1 font-mono"
								:title="fmtVal(currentValue(node.param))"
								@update:model-value="(v: string) => node.param && setParam(node.param, v.split(',').map((s) => s.trim()))" />
							<UInput v-else :model-value="String(currentValue(node.param) ?? '')"
								:disabled="readonly || !node.param.editable" size="sm" class="flex-1 font-mono"
								@update:model-value="(v: string) => node.param && setParam(node.param, v)" />
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
import { ref, computed, toRefs } from 'vue'

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
}>()

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

function toggle(key: string) {
	const depth = getDepth(key)
	if (depth === 0) {
		// Accordion: close all other main categories
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
function getDepth(key: string): number {
	return key.split('.').length - 1
}

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