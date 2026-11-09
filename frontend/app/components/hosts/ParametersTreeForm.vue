<!--
  This file is part of the OPSI-WebGUI application.
  OPSI-WebGUI is the web-based management interface for OPSI.
  https://opsi.org/en/

  Copyright (c) UIB GmbH info@uib.de 2026
  All rights reserved.
  License: AGPL-3.0

  HostsParametersTreeForm - Tree-based form for editing host configuration parameters.
-->
<template>
  <div class="params-tree">
    <div v-for="node in visibleNodes" :key="node.key" class="param-tree-node" :class="{ 'param-tree-node-root': getDepth(node.key) === 0 }">
      <!-- Category node -->
      <template v-if="node.children">
        <div
          :class="[
            'flex items-center gap-1 px-1.5 py-1 rounded cursor-pointer transition-colors group/node',
            'hover:bg-(--color-surface-hover)',
          ]"
          :style="{ paddingLeft: `${8 + getDepth(node.key) * 16}px` }"
          role="button"
          tabindex="0"
          @click="toggle(node.key)"
          @keydown.enter="toggle(node.key)"
          @keydown.space.prevent="toggle(node.key)"
        >
          <span v-for="i in getDepth(node.key)" :key="i" class="tree-guide-line" :style="{ left: `${8 + (i - 1) * 16}px` }" />
          <span
            aria-hidden="true"
            class="inline-flex items-center justify-center w-5 h-5 rounded shrink-0"
            :class="open[node.key] ? 'text-(--color-primary) bg-primary/10' : 'text-(--color-text-muted)'"
          >
            <CoreAppIcon
              :name="icons.chevronRight"
              class="w-3.5 h-3.5 transition-transform duration-200"
              :class="{ 'rotate-90': open[node.key] }"
            />
          </span>
          <span class="text-sm flex-1 truncate transition-colors" :class="open[node.key] ? 'font-medium' : ''">
            {{ node.label }}
          </span>
          <span class="text-xs text-(--color-text-muted)">{{ node.leafCount ?? 0 }}</span>
        </div>
        <div v-if="mounted[node.key]" v-show="open[node.key]" class="children-container">
          <HostsParametersTreeForm :tree="node.children" v-bind="passProps" />
        </div>
      </template>

      <template v-for="(param, paramIndex) in node.params" :key="`${node.key}:${paramIndex}`">
        <div
          :class="[
            'flex items-start gap-1 px-1.5 py-1 rounded transition-colors',
            changedParams.has(param.configId) ? 'bg-(--color-changed-bg)' : 'hover:bg-(--color-surface-hover)',
          ]"
          :style="{ paddingLeft: `${8 + getDepth(node.key) * 16}px` }"
        >
          <span v-for="i in getDepth(node.key)" :key="i" class="tree-guide-line" :style="{ left: `${8 + (i - 1) * 16}px` }" />
          <span class="w-5 flex items-center justify-center shrink-0 mt-1" />
          <div class="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-2.5">
            <div
              class="min-w-0 w-full md:w-2/5 flex items-center gap-1 group/paramrow px-1.5 py-0.5 rounded bg-(--color-surface-hover) md:bg-transparent md:px-0 md:py-0"
            >
              <span class="text-xs font-medium md:font-normal text-(--color-text) truncate select-text min-w-0" :title="param.configId">
                {{ param.configId }}
              </span>
              <span
                class="flex items-center gap-0.5 shrink-0 opacity-0 group-hover/paramrow:opacity-100 group-focus-within/paramrow:opacity-100 transition-opacity"
              >
                <CoreAppButton
                  size="xs"
                  :icon="clipboard.isCopied(param.configId) ? icons.check : icons.copy"
                  variant="ghost"
                  :color="clipboard.isCopied(param.configId) ? 'success' : 'neutral'"
                  class="h-5! min-h-5! px-1!"
                  :title="String(clipboard.isCopied(param.configId) ? $t('common.copied') : $t('common.copy'))"
                  :aria-label="`${String($t('common.copy'))} ${param.configId}`"
                  @click="copyToClipboard(param.configId)"
                />
                <CoreAppTooltip v-if="param.description" :text="param.description">
                  <CoreAppButton
                    size="xs"
                    :icon="icons.info"
                    variant="ghost"
                    color="neutral"
                    class="h-5! min-h-5! px-1!"
                    :aria-label="param.description"
                  />
                </CoreAppTooltip>
              </span>
              <span v-if="changedParams.has(param.configId)" class="inline-flex items-center text-xs text-(--color-changed-text) ml-0.5">
                <CoreAppIcon :name="icons.pencilSquare" class="w-3 h-3" />
              </span>
            </div>
            <div class="w-full md:flex-1 flex items-center gap-1.5 min-w-0">
              <CoreAppPropertyFormItem
                :model-value="currentValue(param)"
                size="xs"
                :type="param.type === 'BoolConfig' ? 'bool' : 'unicode'"
                :possible-values="param.possibleValues || []"
                :multi-value="param.multiValue"
                :editable="param.editable"
                :disabled="readonly"
                :config-id="param.configId"
                :password="isPasswordParam(param.configId)"
                @update:model-value="(v: unknown) => setParam(param, v)"
              />
              <CoreAppButton
                v-if="changedParams.has(param.configId)"
                size="xs"
                variant="ghost"
                color="neutral"
                :icon="icons.x"
                :title="$t('common.discard')"
                @click="() => param && discardSingleParam(param.configId)"
                intent="destructive"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
    <div v-if="hasMore" ref="loadMoreSentinel" class="flex items-center justify-center py-2">
      <span class="text-xs text-(--color-text-muted) animate-pulse">{{ $t('common.loading') }}…</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useIntersectionObserver } from '@vueuse/core'

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
    params?: Param[]
    children?: TreeNode[]
    leafCount?: number
  }

  const props = defineProps<{
    params?: Param[]
    tree?: TreeNode[]
    changedParams: Map<string, unknown>
    readonly: boolean
    currentValue: (p: Param) => unknown
    setParam: (p: Param, v: unknown) => void
    discardSingleParam: (id: string) => void
    icons: ReturnType<typeof useIcons>
    fmtVal: (v: unknown) => string
    autoOpenAll?: boolean
  }>()

  const { t: $t } = useI18n()
  const clipboard = useClipboard()
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

  async function copyToClipboard(text: string) {
    await clipboard.copy(text)
  }

  function buildTree(params: Param[]): TreeNode[] {
    interface ParamNode {
      params: Param[]
      children: Map<string, ParamNode>
    }
    type ParamBranch = Map<string, ParamNode>
    const root: ParamBranch = new Map()
    for (const p of params) {
      const parts = p.configId.split('.')
      let node = root
      let current: ParamNode | undefined
      for (const part of parts) {
        current = node.get(part)
        if (!current) {
          current = { params: [], children: new Map() }
          node.set(part, current)
        }
        node = current.children
      }
      current?.params.push(p)
    }
    function toTree(obj: ParamBranch, prefix = ''): TreeNode[] {
      const entries = [...obj.entries()]
      entries.sort(([, a], [, b]) => {
        const aHasChildren = a.children.size > 0
        const bHasChildren = b.children.size > 0
        if (aHasChildren && !bHasChildren) return -1
        if (!aHasChildren && bHasChildren) return 1
        return 0
      })
      return entries.map(([key, value]) => {
        const children = toTree(value.children, prefix + key + '.')
        const leafCount = value.params.length + children.reduce((sum, c) => sum + (c.leafCount ?? 0), 0)
        return {
          key: prefix + key,
          label: key,
          ...(value.params.length > 0 ? { params: value.params } : {}),
          ...(children.length > 0 ? { children } : {}),
          leafCount,
        }
      })
    }
    return toTree(root)
  }

  const open = ref<Record<string, boolean>>({})
  const mounted = ref<Record<string, boolean>>({})
  const tree = computed<TreeNode[]>(() => props.tree ?? (props.params ? buildTree(props.params) : []))

  // Progressive rendering: only render a batch of nodes at a time to keep initial render fast
  const RENDER_BATCH = 30
  const renderLimit = ref(RENDER_BATCH)
  const visibleNodes = computed(() => tree.value.slice(0, renderLimit.value))
  const hasMore = computed(() => renderLimit.value < tree.value.length)
  const loadMoreSentinel = ref<HTMLElement | null>(null)

  watch(
    () => tree.value.length,
    () => {
      renderLimit.value = RENDER_BATCH
    },
  )

  useIntersectionObserver(loadMoreSentinel, ([entry]) => {
    if (entry?.isIntersecting && hasMore.value) {
      renderLimit.value = Math.min(renderLimit.value + RENDER_BATCH, tree.value.length)
    }
  })

  // Auto-open the first main category when tree data becomes available
  watch(
    tree,
    (newTree) => {
      if (newTree.length > 0 && Object.keys(open.value).length === 0) {
        const firstCategory = newTree.find((n) => n.children)
        if (firstCategory) {
          open.value[firstCategory.key] = true
          mounted.value[firstCategory.key] = true
        }
      }
    },
    { immediate: true },
  )

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
        const mainCategories = tree.value.filter((n) => getDepth(n.key) === 0)
        for (const node of mainCategories) {
          open.value[node.key] = false
        }
        const firstCategory = mainCategories[0]
        if (firstCategory) open.value[firstCategory.key] = true
      }
    },
  )
</script>

<style scoped>
  .params-tree {
    user-select: text;
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
