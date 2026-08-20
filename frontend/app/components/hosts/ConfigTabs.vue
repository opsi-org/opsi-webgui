<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  HostsConfigTabs - Tabbed host configuration editor with panel and standalone mode.
-->
<template>
  <div class="flex flex-col h-full min-h-0 opsi-compact-page opsi-dense-form">
    <CoreAppNavigationGuardModal
      v-if="showHostSelector || !panelMode"
      v-model="showLeaveWarning"
      @cancel="cancelLeave"
      @confirm="confirmLeave"
    />

    <HostsCreateConfigModal v-model:open="showCreateConfigModal" @created="fetchParameters" />

    <div class="shrink-0 sticky top-0 z-10 bg-(--color-surface) mb-1">
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <div class="flex items-center gap-1.5">
          <CoreAppTabsNav v-model="activeTab" :tabs="tabDefs" />
          <template v-if="showHostSelector">
            <span class="h-5 w-px bg-(--color-border) mx-1" />
            <slot name="hostSelector">
              <HostsSelector v-model="hostSelectorModel" :type="hostType" :placeholder="hostSelectorPlaceholder" allow-clear />
            </slot>
          </template>
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <CoreAppFilterInput v-model="paramSearch" size="xs" input-class="w-full sm:w-52 md:w-64 lg:w-72" />
          <CoreAppButton
            v-if="isServerDefaultMode && !readonly"
            :icon="icons.add"
            color="primary"
            variant="soft"
            size="sm"
            :title="String($t('config.create'))"
            @click="showCreateConfigModal = true"
          >
            <span class="hidden sm:inline">{{ $t('config.create') }}</span>
          </CoreAppButton>
          <CoreAppUnsavedChangesModal
            v-if="showUnsavedModal"
            :config-ref="unsavedChangesRef"
            size="sm"
            @save-all="saveAll"
            @discard-all="discardAll"
          />
          <CoreAppButton
            :icon="icons.refresh"
            color="primary"
            variant="outline"
            size="sm"
            :loading="loadingParams || loadingAttrs"
            :title="String($t('common.refresh'))"
            @click="refresh"
          />
        </div>
      </div>
    </div>

    <div v-show="activeTab === 'parameters'" :class="['flex flex-col min-h-0 flex-1 overflow-hidden bg-(--color-surface)']">
      <div v-if="loadingParams" class="py-8 flex justify-center">
        <CoreAppLoadingSpinner size="md" />
      </div>
      <CoreAppEmptyState
        v-else-if="categoryAwareTree.length === 0"
        :icon="icons.config"
        :message="hostId || hostType === 'server' ? String($t('config.paramsNone')) : String($t('hosts.select'))"
      />
      <CoreAppCard
        v-else
        :ui="{
          root: 'flex flex-col min-h-0 flex-1',
          body: 'p-0 overflow-y-auto min-h-0 flex-1',
        }"
      >
        <HostsParametersTreeForm
          :tree="categoryAwareTree"
          :changed-params="changedParams"
          :readonly="readonly"
          :current-value="currentValue"
          :set-param="setParam"
          :discard-single-param="discardSingleParam"
          :icons="icons"
          :fmt-val="fmtVal"
          :auto-open-all="!!paramSearch"
        />
      </CoreAppCard>
    </div>

    <div v-show="activeTab === 'attributes'" :class="['flex flex-col min-h-0 flex-1 overflow-hidden bg-(--color-surface)']">
      <div v-if="loadingAttrs" class="py-8 flex justify-center">
        <CoreAppLoadingSpinner size="md" />
      </div>
      <CoreAppEmptyState v-else-if="!hostId" :icon="icons.config" :message="String($t('hosts.select'))" />
      <CoreAppCard
        v-else-if="filteredReadonlyAttrKeys.length || filteredEditableAttrKeys.length"
        :ui="{ root: 'flex flex-col min-h-0 flex-1', body: 'overflow-y-auto min-h-0 flex-1' }"
      >
        <div
          v-if="filteredReadonlyAttrKeys.length"
          :class="['border-b border-(--color-border)', filteredEditableAttrKeys.length ? 'mb-1' : '']"
        >
          <div
            v-for="key in filteredReadonlyAttrKeys"
            :key="key"
            class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-0.5 gap-x-4 hover:bg-(--color-surface-hover) rounded transition-colors"
          >
            <span class="text-sm text-(--color-text) min-w-0 md:w-1/3 break-all">
              {{ getAttributeLabel(key) }}
            </span>
            <span class="text-sm flex-1 truncate" :title="fmtVal(originalAttributes[key])">
              {{ fmtVal(originalAttributes[key]) }}
            </span>
          </div>
        </div>

        <div v-if="filteredEditableAttrKeys.length">
          <div
            v-for="key in filteredEditableAttrKeys"
            :key="key"
            class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-0.5 gap-x-4 hover:bg-(--color-surface-hover) rounded transition-colors"
            :class="isAttrChanged(key) ? 'bg-(--color-changed-bg)' : ''"
          >
            <span class="text-sm text-(--color-text) min-w-0 md:w-1/3 break-all">
              {{ getAttributeLabel(key) }}
              <span v-if="isAttrChanged(key)" class="inline-flex items-center text-xs text-(--color-changed-text)">
                <CoreAppIcon :name="icons.pencilSquare" class="w-3 h-3" />
              </span>
            </span>
            <div class="flex-1 flex items-center gap-2 min-w-0">
              <CoreAppCheckbox
                v-if="typeof originalAttributes[key] === 'boolean'"
                v-model="(editableAttributes as Record<string, boolean>)[key]"
                :disabled="readonly"
              />
              <CoreAppCheckbox
                v-else-if="key === 'isMasterDepot'"
                :model-value="editableAttributes[key] === true || editableAttributes[key] === 'true'"
                :disabled="readonly"
                @update:model-value="
                  (v: boolean | 'indeterminate') => {
                    editableAttributes[key] = v
                  }
                "
              />
              <CoreAppPasswordInput
                v-else-if="isPasswordAttribute(key)"
                v-model="(editableAttributes as Record<string, string>)[key]"
                size="xs"
                :disabled="readonly"
                class="flex-1"
                :maxlength="32"
              />
              <CoreAppInput
                v-else
                v-model="(editableAttributes as Record<string, string>)[key]"
                size="xs"
                :disabled="readonly"
                class="flex-1"
              />
              <CoreAppButton
                v-if="isAttrChanged(key)"
                size="xs"
                variant="ghost"
                color="neutral"
                :icon="icons.x"
                :title="$t('common.discard')"
                @click="discardSingleAttribute(key)"
              />
            </div>
          </div>
        </div>
      </CoreAppCard>
    </div>
  </div>
</template>

<script setup lang="ts">
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

  interface Props {
    hostId?: string | null
    hostType?: 'client' | 'server'
    readonly?: boolean
    tab?: string
    showTabs?: boolean
    search?: string
    panelMode?: boolean
    showChangeBanner?: boolean
    showHostSelector?: boolean
    hostSelectorPlaceholder?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    hostId: null,
    hostType: 'client',
    readonly: false,
    tab: '',
    showTabs: true,
    search: undefined,
    panelMode: false,
    showChangeBanner: true,
    showHostSelector: false,
    hostSelectorPlaceholder: undefined,
  })

  const emit = defineEmits<{
    saved: []
    'attribute-change': [hasChanges: boolean]
    'update:search': [value: string]
    'update:hostId': [value: string | null]
    'update:tab': [value: string]
  }>()

  const icons = useIcons()
  const { t: $t } = useI18n()
  const {
    getHostConfigObjects,
    saveHostConfigState,
    saveServerConfigValues,
    getHostAttributes,
    getServerAttributes,
    updateClientAttributes,
    updateServerAttributes,
    getServerDefaultConfig,
  } = useApiHelpers()

  const isServerDefaultMode = computed(() => props.hostType === 'server' && !props.hostId)

  // Create Config modal state
  const showCreateConfigModal = ref(false)

  const activeTab = ref(props.tab || 'parameters')
  watch(
    () => props.tab,
    (v) => {
      if (v) activeTab.value = v
    },
  )
  watch(activeTab, (v) => emit('update:tab', v))

  const hostSelectorModel = ref<string>(props.hostId || '')
  watch(
    () => props.hostId,
    (v) => {
      hostSelectorModel.value = v || ''
    },
  )

  let pendingHostChangeId: string | null = null
  let _ignoreHostSelectorWatch = false

  watch(hostSelectorModel, (newVal) => {
    if (_ignoreHostSelectorWatch) {
      _ignoreHostSelectorWatch = false
      return
    }
    if (hasAnyChanges.value && newVal !== (props.hostId || '')) {
      pendingHostChangeId = newVal
      _ignoreHostSelectorWatch = true
      hostSelectorModel.value = props.hostId || ''
      showLeaveWarning.value = true
      return
    }
    emit('update:hostId', newVal || null)
  })

  const showLeaveWarning = ref(false)
  let resolveLeave: ((ok: boolean) => void) | null = null

  const showUnsavedModal = computed(() => hasAnyChanges.value || changedParams.value.size > 0 || hasAttributeChanges.value)

  const unsavedChangesRef = computed(() => ({
    hasAnyChanges: hasAnyChanges.value,
    isSaving: isSaving.value,
    changedCount: changedCount.value,
    changedParams: changedParams.value,
    changedAttributesList: changedAttributesList.value,
    saveAll,
    discardAll,
    discardSingleParam,
    discardSingleAttribute,
    getOriginalParamValue,
    fmtVal,
  }))

  if (!props.panelMode) {
    onBeforeRouteLeave(() => {
      if (!hasAnyChanges.value) return true
      showLeaveWarning.value = true
      return new Promise<boolean>((resolve) => {
        resolveLeave = resolve
      })
    })
  }

  function confirmLeave() {
    showLeaveWarning.value = false
    discardAll()
    if (pendingHostChangeId !== null) {
      const id = pendingHostChangeId
      pendingHostChangeId = null
      hostSelectorModel.value = id
      // hasAnyChanges is now false after discardAll, so the watch will emit update:hostId
    }
    resolveLeave?.(true)
    resolveLeave = null
  }

  function cancelLeave() {
    showLeaveWarning.value = false
    pendingHostChangeId = null
    resolveLeave?.(false)
    resolveLeave = null
  }

  const showParamChanges = ref(false)
  const showAttrChanges = ref(false)

  const tabDefs = computed(() => [
    {
      label: !props.hostId && props.hostType === 'server' ? String($t('config.paramsDefault')) : String($t('config.params')),
      value: 'parameters',
    },
    { label: String($t('common.attributes')), value: 'attributes' },
  ])
  const loadingParams = ref(false)
  const savingParams = ref(false)
  const rawParams = shallowRef<Record<string, Param[]>>({})
  const changedParams = ref(new Map<string, unknown>())
  const _internalSearch = ref('')
  const paramSearch = computed({
    get: () => (props.search !== undefined ? props.search : _internalSearch.value),
    set: (v: string) => {
      if (props.search !== undefined) emit('update:search', v)
      else _internalSearch.value = v
    },
  })
  const activeCategory = ref('all')
  const paramsFetchRequestId = ref(0)

  const flatParams = computed<Param[]>(() => {
    const all: Param[] = []
    for (const items of Object.values(rawParams.value)) {
      for (const p of items) {
        if (p.configId) {
          all.push(p)
        }
      }
    }
    return all.sort((a, b) => a.configId.localeCompare(b.configId))
  })

  interface TreeNode {
    key: string
    label: string
    param?: Param
    children?: TreeNode[]
    leafCount?: number
  }

  const categoryAwareTree = computed<TreeNode[]>(() => {
    const q = paramSearch.value.trim().toLowerCase()
    const raw = rawParams.value
    const categoryOrder = ['general', 'clientconfig', 'opsi-script', 'opsiclientd', 'software-on-demand', 'licensing']
    const categoryKeys = [
      ...categoryOrder.filter((k) => k in raw),
      ...Object.keys(raw)
        .filter((k) => !categoryOrder.includes(k))
        .sort(),
    ]

    function buildSubTree(params: Param[], prefix: string): TreeNode[] {
      type ParamLeaf = { __param: Param }
      type ParamBranch = Map<string, ParamLeaf | ParamBranch>
      const root: ParamBranch = new Map()
      for (const p of params) {
        if (q && !p.configId.toLowerCase().includes(q) && !(p.description || '').toLowerCase().includes(q)) continue
        const parts = p.configId.split('.')
        let node = root
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i]
          if (!part) continue
          if (i === parts.length - 1) {
            node.set(part, { __param: p })
          } else {
            const existing = node.get(part)
            if (existing instanceof Map) {
              node = existing
            } else {
              const branch: ParamBranch = new Map()
              node.set(part, branch)
              node = branch
            }
          }
        }
      }
      function toTree(obj: ParamBranch, pre: string): TreeNode[] {
        return [...obj.entries()]
          .sort(([, a], [, b]) => {
            const aP = !(a instanceof Map)
            const bP = !(b instanceof Map)
            if (aP && !bP) return 1
            if (!aP && bP) return -1
            return 0
          })
          .map(([key, value]) => {
            if (!(value instanceof Map)) {
              return { key: pre + key, label: key, param: value.__param, leafCount: 1 }
            }
            const children = toTree(value, pre + key + '.')
            const leafCount = children.reduce((sum, c) => sum + (c.leafCount ?? 0), 0)
            return { key: pre + key, label: key, children, leafCount }
          })
          .filter((n) => n.param || (n.children && n.children.length > 0))
      }
      return toTree(root, prefix)
    }

    return categoryKeys
      .map((cat) => {
        const children = buildSubTree(raw[cat] || [], cat + '.')
        const leafCount = children.reduce((sum, c) => sum + (c.leafCount ?? 0), 0)
        return { key: cat, label: cat, children, leafCount }
      })
      .filter((n) => n.children.length > 0)
  })

  function getOriginalValue(p: Param): unknown {
    let raw: unknown
    if (props.hostId && p.objects && props.hostId in p.objects) {
      raw = p.objects[props.hostId]
    } else if (!props.hostId && p.value !== undefined) {
      raw = p.value
    } else if (p.defaultValues !== undefined) {
      raw = p.defaultValues
    } else {
      raw = p.type === 'BoolConfig' ? false : ''
    }
    if (p.type === 'BoolConfig') {
      if (typeof raw === 'boolean') return raw
      if (Array.isArray(raw)) return raw.length > 0 ? Boolean(raw[0]) : false
      return Boolean(raw)
    }
    if (p.multiValue) {
      if (Array.isArray(raw)) return raw.map(String)
      if (raw === '' || raw === null || raw === undefined) return []
      return [String(raw)]
    }
    if (Array.isArray(raw)) return raw.length > 0 ? String(raw[0]) : ''
    if (raw === null || raw === undefined) return ''
    return String(raw)
  }

  function currentValue(p: Param): unknown {
    if (changedParams.value.has(p.configId)) return changedParams.value.get(p.configId)
    return getOriginalValue(p)
  }

  function fmtVal(v: unknown): string {
    if (v === null || v === undefined) return '-'
    if (Array.isArray(v)) return v.join(', ')
    return String(v)
  }

  function setParam(p: Param, value: unknown) {
    const orig = getOriginalValue(p)
    if (JSON.stringify(orig) === JSON.stringify(value)) changedParams.value.delete(p.configId)
    else changedParams.value.set(p.configId, value)
  }

  function getOriginalParamValue(configId: string): unknown {
    const p = flatParams.value.find((fp) => fp.configId === configId)
    if (!p) return undefined
    return getOriginalValue(p)
  }

  function discardSingleParam(configId: string) {
    const next = new Map(changedParams.value)
    next.delete(configId)
    changedParams.value = next
  }

  const loadingAttrs = ref(false)
  const savingAttrs = ref(false)
  const attributesLoadedHostId = ref<string | null>(null)
  const originalAttributes = ref<Record<string, unknown>>({})
  const editableAttributes = ref<Record<string, unknown>>({})

  const hasAttributeChanges = computed(() =>
    Object.keys(editableAttributes.value).some(
      (k) => !isReadonlyAttribute(k) && JSON.stringify(originalAttributes.value[k]) !== JSON.stringify(editableAttributes.value[k]),
    ),
  )
  watch(hasAttributeChanges, (v) => emit('attribute-change', v))

  const changedAttributesList = computed(() =>
    Object.keys(editableAttributes.value)
      .filter((k) => !isReadonlyAttribute(k) && JSON.stringify(originalAttributes.value[k]) !== JSON.stringify(editableAttributes.value[k]))
      .map((k) => ({
        key: k,
        label: getAttributeLabel(k),
        oldValue: originalAttributes.value[k],
        newValue: editableAttributes.value[k],
      })),
  )

  function discardSingleAttribute(key: string) {
    editableAttributes.value = { ...editableAttributes.value, [key]: originalAttributes.value[key] }
  }

  const READONLY_KEYS = ['type', 'created', 'lastSeen', 'systemUUID', 'hostId', 'depotId', 'id']
  const PASSWORD_KEYS = ['opsiHostKey', 'oneTimePassword']
  const ATTR_LABELS: Record<string, string> = {
    hostId: 'Host ID',
    depotId: 'Depot ID',
    description: 'Description',
    notes: 'Notes',
    hardwareAddress: 'MAC Address',
    ipAddress: 'IP Address',
    inventoryNumber: 'Inventory #',
    created: 'Created',
    lastSeen: 'Last Seen',
    systemUUID: 'System UUID',
    opsiHostKey: 'OPSI Host Key',
    oneTimePassword: 'One-Time Password',
    type: 'Type',
    isMasterDepot: 'Is Master Depot',
    masterDepotId: 'Master Depot ID',
    networkAddress: 'Network Address',
    depotRemoteUrl: 'Depot URL',
  }

  const isReadonlyAttribute = (k: string) => READONLY_KEYS.includes(k)
  const isPasswordAttribute = (k: string) => PASSWORD_KEYS.includes(k)
  const getAttributeLabel = (k: string) => ATTR_LABELS[k] || k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())

  const readonlyAttrKeys = computed(() => Object.keys(editableAttributes.value).filter((k) => isReadonlyAttribute(k)))
  const editableAttrKeys = computed(() => Object.keys(editableAttributes.value).filter((k) => !isReadonlyAttribute(k)))
  const attributeSearch = computed(() => paramSearch.value.trim().toLowerCase())

  const filteredReadonlyAttrKeys = computed(() =>
    readonlyAttrKeys.value.filter(
      (k) =>
        getAttributeLabel(k).toLowerCase().includes(attributeSearch.value) ||
        String(originalAttributes.value[k] ?? '')
          .toLowerCase()
          .includes(attributeSearch.value),
    ),
  )

  const filteredEditableAttrKeys = computed(() =>
    editableAttrKeys.value.filter(
      (k) =>
        getAttributeLabel(k).toLowerCase().includes(attributeSearch.value) ||
        String(editableAttributes.value[k] ?? '')
          .toLowerCase()
          .includes(attributeSearch.value),
    ),
  )

  async function fetchParameters() {
    const requestId = ++paramsFetchRequestId.value
    loadingParams.value = true
    try {
      if (props.hostId) {
        const { data } = await getHostConfigObjects(props.hostId)
        if (requestId !== paramsFetchRequestId.value) return
        rawParams.value = (data as Record<string, Param[]>) || {}
      } else if (props.hostType === 'server') {
        // Server defaults are fetched once in full; filtering happens client-side
        // in categoryAwareTree (refetching per keystroke made search feel slow).
        const { data } = await getServerDefaultConfig()
        if (requestId !== paramsFetchRequestId.value) return
        rawParams.value = (data as Record<string, Param[]>) || {}
      } else {
        if (requestId !== paramsFetchRequestId.value) return
        rawParams.value = {}
      }
    } catch {
      if (requestId !== paramsFetchRequestId.value) return
      rawParams.value = {}
    } finally {
      if (requestId === paramsFetchRequestId.value) {
        loadingParams.value = false
      }
    }
  }

  async function fetchAttributes() {
    if (!props.hostId) {
      attributesLoadedHostId.value = null
      originalAttributes.value = {}
      editableAttributes.value = {}
      return
    }
    loadingAttrs.value = true
    try {
      const fetcher = props.hostType === 'server' ? getServerAttributes(props.hostId) : getHostAttributes(props.hostId)
      const { data } = await fetcher
      const attrs = (data as Array<Record<string, unknown>>)?.[0] || {}
      originalAttributes.value = { ...attrs }
      editableAttributes.value = { ...attrs }
      attributesLoadedHostId.value = props.hostId
    } catch {
      attributesLoadedHostId.value = null
      originalAttributes.value = {}
      editableAttributes.value = {}
    } finally {
      loadingAttrs.value = false
    }
  }

  watch(
    () => props.hostId,
    async (newId) => {
      changedParams.value.clear()
      _internalSearch.value = ''
      if (props.search !== undefined) emit('update:search', '')
      activeCategory.value = 'all'
      await fetchParameters()
      if (newId && activeTab.value === 'attributes') {
        await fetchAttributes()
      } else {
        attributesLoadedHostId.value = null
        originalAttributes.value = {}
        editableAttributes.value = {}
      }
    },
    { immediate: true },
  )

  watch(activeTab, async (tab) => {
    if (tab !== 'attributes' || !props.hostId) return
    if (attributesLoadedHostId.value === props.hostId) return
    await fetchAttributes()
  })

  watch(
    () => props.hostType,
    async (type) => {
      if (type === 'server' && !props.hostId) await fetchParameters()
    },
    { immediate: false },
  )

  async function saveParameters() {
    savingParams.value = true
    try {
      const changes = Array.from(changedParams.value.entries()).map(([configId, value]) => ({
        configId,
        value,
      }))
      if (props.hostId) await saveHostConfigState(props.hostId, changes)
      else await saveServerConfigValues(changes)
      changedParams.value.clear()
      await fetchParameters()
      emit('saved')
    } finally {
      savingParams.value = false
    }
  }

  function discardParams() {
    changedParams.value.clear()
    showParamChanges.value = false
  }

  async function saveAttributes() {
    if (!props.hostId) return
    savingAttrs.value = true
    try {
      // Only send changed attributes to avoid re-hashing already-stored password fields
      const changedAttrs: Record<string, unknown> = {}
      for (const key of Object.keys(editableAttributes.value)) {
        if (!isReadonlyAttribute(key) && JSON.stringify(originalAttributes.value[key]) !== JSON.stringify(editableAttributes.value[key])) {
          changedAttrs[key] = editableAttributes.value[key]
        }
      }
      if (Object.keys(changedAttrs).length === 0) return
      if (props.hostType === 'server') await updateServerAttributes(props.hostId, changedAttrs)
      else await updateClientAttributes(props.hostId, changedAttrs)
      originalAttributes.value = { ...editableAttributes.value }
      emit('saved')
    } finally {
      savingAttrs.value = false
    }
  }

  function discardAttributeChanges() {
    editableAttributes.value = { ...originalAttributes.value }
    showAttrChanges.value = false
  }

  const hasParamChanges = computed(() => changedParams.value.size > 0)
  const hasAnyChanges = computed(() => hasParamChanges.value || hasAttributeChanges.value)
  const changedCount = computed(() => changedParams.value.size + changedAttributesList.value.length)
  const isSaving = computed(() => savingParams.value || savingAttrs.value)

  function isAttrChanged(key: string): boolean {
    return !isReadonlyAttribute(key) && JSON.stringify(originalAttributes.value[key]) !== JSON.stringify(editableAttributes.value[key])
  }

  async function saveAll() {
    if (hasParamChanges.value) await saveParameters()
    if (hasAttributeChanges.value) await saveAttributes()
  }

  function discardAll() {
    discardParams()
    discardAttributeChanges()
  }

  async function refresh() {
    changedParams.value.clear()
    await fetchParameters()
    if (props.hostId && activeTab.value === 'attributes') await fetchAttributes()
  }

  defineExpose({
    refresh,
    hasParamChanges,
    hasAttributeChanges,
    hasAnyChanges,
    changedCount,
    isSaving,
    changedParams,
    changedAttributesList,
    paramSearch,
    saveParameters,
    discardParams,
    saveAttributes,
    discardAttributeChanges,
    discardSingleParam,
    discardSingleAttribute,
    saveAll,
    discardAll,
    getOriginalParamValue,
    fmtVal,
  })
</script>
