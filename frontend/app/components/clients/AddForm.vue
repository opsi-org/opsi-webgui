<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ClientsAddForm - Form for adding a new client.
-->
<template>
  <div class="flex flex-col h-full opsi-dense-form opsi-compact-page">
    <div v-if="!canCreateClients || isReadOnly" class="flex items-center justify-center h-full p-8">
      <CoreAppAlertInline color="warning" :title="$t('auth.permissionDenied')">
        <template #description>{{
          isReadOnly
            ? $t('opsiConfig.serverFeatures.readOnly.disabled')
            : $t('opsiConfig.serverFeatures.clientCreation.disabled')
        }}</template>
      </CoreAppAlertInline>
    </div>
    <template v-else>
      <div class="shrink-0 sticky top-0 z-10 bg-(--color-surface) px-2 py-1.5">
        <div class="flex items-center justify-between">
          <CoreAppAlertInline v-if="success" color="success" :title="String($t('common.success'))" class="flex-1 mr-2">
            <template #description>{{ $t('clients.create.ok') }}</template>
          </CoreAppAlertInline>
          <CoreAppAlertInline v-else-if="error" color="error" :title="String($t('common.error'))" :description="error"
            closable class="flex-1 mr-2" @close="error = null" />
          <div v-else />
          <div class="flex gap-2 shrink-0">
            <CoreAppButton color="success" :loading="loading" size="sm" :disabled="!canCreate"
              :title="String($t('clients.create.title'))" @click="handleSubmit">
              <CoreAppIcon :name="icons.add" />
              {{ $t('clients.create.title') }}
            </CoreAppButton>
            <CoreAppButton variant="outline" color="primary" size="sm" :icon="icons.refresh" :disabled="loading"
              :title="String($t('common.reset'))" @click="resetForm" />
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto space-y-2">
        <div class="opsi-card">
          <div class="flex items-center justify-between mb-2">
            <CoreAppHeading size="xs" tag="h2">{{ $t('clients.create.title') }}</CoreAppHeading>
          </div>
          <div>
            <div
              class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
              <span class="text-sm min-w-0 md:w-1/3 break-all">
                {{ $t('clients.id') }} <span class="text-error">*</span>
              </span>
              <div class="flex-1 flex flex-col items-start gap-1 min-w-0">
                <div class="flex items-center gap-2 w-full">
                  <CoreAppInput v-model="clientName" :disabled="loading" size="sm"
                    :placeholder="String($t('fields.hostname.enter'))" class="flex-1" />
                  <CoreAppInput v-model="domain" :disabled="loading" size="sm"
                    :placeholder="String($t('fields.domainExample'))" class="flex-1" />
                </div>
                <div v-if="formErrors.clientId" class="text-xs text-error">
                  {{ formErrors.clientId }}
                </div>
              </div>
            </div>
            <div
              class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
              <span class="text-sm min-w-0 md:w-1/3 break-all">
                {{ $t('common.description') }}
              </span>
              <div class="flex-1">
                <CoreAppInput v-model="form.description" :disabled="loading" size="sm"
                  :placeholder="String($t('common.description'))" class="w-full" />
              </div>
            </div>
            <div
              class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
              <span class="text-sm min-w-0 md:w-1/3 break-all">
                {{ $t('fields.inventory') }}
              </span>
              <div class="flex-1">
                <CoreAppInput v-model="form.inventoryNumber" :disabled="loading" size="sm"
                  :placeholder="String($t('fields.inventory'))" class="w-full" />
              </div>
            </div>
            <div
              class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
              <span class="text-sm min-w-0 md:w-1/3 break-all">
                {{ $t('fields.ip') }}
              </span>
              <div class="flex-1">
                <CoreAppInput v-model="form.ipAddress" :disabled="loading" size="sm"
                  :placeholder="String($t('fields.ipExample'))" class="w-full" />
              </div>
            </div>
            <div
              class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
              <span class="text-sm min-w-0 md:w-1/3 break-all">
                {{ $t('fields.mac') }}
              </span>
              <div class="flex-1">
                <CoreAppInput v-model="form.macAddress" :disabled="loading" size="sm"
                  :placeholder="String($t('fields.macExample'))" class="w-full" />
              </div>
            </div>
            <div
              class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
              <span class="text-sm min-w-0 md:w-1/3 break-all">
                {{ $t('common.notes') }}
              </span>
              <div class="flex-1">
                <CoreAppTextarea v-model="form.notes" :disabled="loading" size="sm" :rows="3"
                  :placeholder="String($t('common.notes'))" class="flex-1 w-full" />
              </div>
            </div>
          </div>
        </div>

        <div class="opsi-card">
          <div class="flex items-center justify-between mb-2">
            <CoreAppHeading size="xs" tag="h2">{{ $t('common.assignments') }}</CoreAppHeading>
          </div>
          <div>
            <div
              class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
              <span class="text-sm min-w-0 md:w-1/3 break-all">
                {{ $t('depot.title') }} <span class="text-error">*</span>
              </span>
              <div class="flex-1 flex flex-col items-start gap-1 min-w-0">
                <CoreAppSelect v-model="form.depotId" :items="depotOptions" :loading="loadingDepots"
                  :aria-label="String($t('depot.title'))" :disabled="loading" size="sm" class="w-full" />
                <div v-if="formErrors.depotId" class="text-xs text-error">
                  {{ formErrors.depotId }}
                </div>
              </div>
            </div>
            <div
              class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
              <span class="text-sm min-w-0 md:w-1/3 break-all">
                {{ $t('groups.title') }}
              </span>
              <div class="flex-1 min-w-0 space-y-1.5">
                <CoreAppFilterInput v-model="groupSearch" size="sm" :placeholder="$t('common.filter') + '...'"
                  :disabled="loading" />
                <div class="border border-(--color-border) rounded-md overflow-hidden">
                  <div class="max-h-40 overflow-auto px-1 py-0.5">
                    <div v-for="item in visibleGroupTreeItems" :key="`group-tree-${item.id}`"
                      class="flex items-center gap-1 px-1.5 py-0.5 text-xs"
                      :class="selectedGroupIds.has(item.id) ? 'bg-opsi-blue/5' : ''">
                      <CoreAppButton v-if="item.hasChildren" variant="ghost" color="neutral" size="xs"
                        class="p-0.5 h-4 w-4" :style="{ marginLeft: `${item.level * 12}px` }"
                        :aria-label="`${expandedGroupIds.has(item.id) ? $t('common.collapse') : $t('common.expand')} ${item.label}`"
                        :title="`${expandedGroupIds.has(item.id) ? $t('common.collapse') : $t('common.expand')} ${item.label}`"
                        @click.prevent="toggleGroupExpand(item.node)">
                        <CoreAppIcon :name="expandedGroupIds.has(item.id) ? icons.chevronDown : icons.chevronRight"
                          class="w-2.5 h-2.5" />
                      </CoreAppButton>
                      <span v-else class="shrink-0" :style="{ marginLeft: `${item.level * 12 + 20}px` }" />

                      <CoreAppCheckbox :model-value="selectedGroupIds.has(item.id)" :aria-label="item.label"
                        :disabled="loading" @update:model-value="toggleGroupSelection(item.node)" />
                      <button type="button"
                        class="truncate text-left bg-transparent border-0 p-0 flex-1 cursor-pointer leading-tight"
                        :disabled="loading" @click.prevent="toggleGroupSelection(item.node)">
                        {{ item.label }}
                      </button>
                    </div>
                    <div v-if="visibleGroupTreeItems.length === 0" class="text-xs text-(--color-text-muted) py-2 px-2">
                      {{ groupSearch ? $t('common.noResults') : $t('common.noData') }}
                    </div>
                  </div>
                </div>
                <div class="text-xs text-(--color-text-muted)">
                  {{ form.groups.length }} {{ $t('common.selected') }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="opsi-card">
          <div class="flex items-center justify-between mb-2">
            <CoreAppHeading size="xs" tag="h2">{{ $t('clients.initialSetup') }}</CoreAppHeading>
          </div>
          <div>
            <div
              class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
              <span class="text-sm min-w-0 md:w-1/3 break-all">
                {{ $t('products.netboot') }}
              </span>
              <div class="flex-1 flex items-center gap-2 min-w-0">
                <CoreAppSelectMenu v-model="form.netbootProducts" :items="netbootProductOptions" multiple
                  :aria-label="String($t('products.netboot'))" :disabled="loading" size="sm" class="w-full" />
              </div>
            </div>
            <div
              class="form-row w-full flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
              <span class="text-sm min-w-0 md:w-1/3 break-all flex items-center gap-1.5">
                <CoreAppImage src="opsi-client-agent.svg" dark-src="opsi-client-agent-light.svg"
                  :alt="String($t('clients.deploy'))" image-class="w-8 h-8 shrink-0" />
                {{ $t('clients.deploy') }}
              </span>
              <div class="flex-1 flex items-center gap-2 min-w-0">
                <CoreAppCheckbox v-model="form.agentSetup" :aria-label="String($t('clients.deploy'))"
                  :disabled="loading" />
              </div>
            </div>
            <div v-if="form.agentSetup" class="ml-4 border-l-2 border-(--color-border) pl-4 space-y-0">
              <div
                class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
                <span class="text-sm min-w-0 md:w-1/3 break-all">
                  {{ $t('common.type') }}
                </span>
                <div class="flex-1">
                  <div class="grid grid-cols-3 gap-2">
                    <CoreAppButton v-for="os in osTypes" :key="os.value"
                      :variant="form.agentType === os.value ? 'solid' : 'outline'"
                      :color="form.agentType === os.value ? 'primary' : 'neutral'" size="sm" class="justify-center"
                      :disabled="loading" @click="form.agentType = os.value">
                      <CoreAppIcon :name="os.icon" class="w-4 h-4 mr-1" />
                      {{ os.label }}
                    </CoreAppButton>
                  </div>
                </div>
              </div>
              <div
                class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
                <span class="text-sm min-w-0 md:w-1/3 break-all flex items-center gap-1.5">
                  <CoreAppIcon :name="icons.user" class="w-4 h-4 text-(--color-text-muted)" />
                  {{ $t('auth.username') }}
                </span>
                <div class="flex-1 flex items-center gap-2 min-w-0">
                  <CoreAppInput v-model="form.agentUsername" :disabled="loading" size="sm"
                    :placeholder="String($t('fields.adminUsername'))" class="w-full" />
                </div>
              </div>
              <div
                class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
                <span class="text-sm min-w-0 md:w-1/3 break-all flex items-center gap-1.5">
                  <CoreAppIcon :name="icons.key" class="w-4 h-4 text-(--color-text-muted)" />
                  {{ $t('auth.password') }}
                </span>
                <div class="flex-1 flex items-center gap-2 min-w-0">
                  <CoreAppInput v-model="form.agentPassword" :disabled="loading" size="sm" type="password"
                    :placeholder="String($t('auth.enterPassword'))" class="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { GroupTreeNodeData } from '~/types'
import { useSelectionStore } from '~/stores/selectionStore'

const { canCreateClients, isReadOnly } = useUserPermissions()

const emit = defineEmits<{
  saved: []
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const {
  createClient,
  deployClientAgent,
  getServers,
  getClientIds,
  getServersProducts,
  addClientToGroups,
  setClientProductActions,
} = useApiHelpers()
const { clientGroupsTree, fetchClientGroups, fetchGroupChildrenLazy } = useCachedData()
const selectionStore = useSelectionStore()

const loading = ref(false)
const loadingDepots = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const clientName = ref('')
const domain = ref('')
const clientIds = ref<string[]>([])

const form = reactive({
  description: '',
  inventoryNumber: '',
  depotId: '',
  ipAddress: '',
  macAddress: '',
  notes: '',
  agentSetup: false,
  agentType: 'windows' as 'windows' | 'linux' | 'mac',
  agentUsername: '',
  agentPassword: '',
  netbootProducts: [] as Array<{ label: string; value: string }>,
  groups: [] as Array<{ label: string; value: string }>,
})

const formErrors = reactive({ clientId: '', depotId: '' })
const depots = ref<Array<{ depotId: string; description: string }>>([])
const netbootProductOptions = ref<Array<{ label: string; value: string }>>([])
const groupSearch = ref('')
const expandedGroupIds = ref<Set<string>>(new Set())

interface GroupTreeFlatItem {
  id: string
  label: string
  level: number
  hasChildren: boolean
  node: GroupTreeNodeData
}

const osTypes = [
  { value: 'windows' as const, label: 'Windows', icon: icons.windows },
  { value: 'linux' as const, label: 'Linux', icon: icons.linux },
  { value: 'mac' as const, label: 'macOS', icon: icons.apple },
]

const depotOptions = computed(() =>
  depots.value.map((d) => ({
    label: d.description ? `${d.depotId} - ${d.description}` : d.depotId,
    value: d.depotId,
  }))
)

const canCreate = computed(
  () =>
    clientName.value.length > 0 &&
    !Number.isInteger(parseInt(clientName.value.charAt(0))) &&
    !clientIds.value.includes(clientName.value + domain.value) &&
    form.depotId &&
    !loading.value
)

const rootGroupNodes = computed<GroupTreeNodeData[]>(() => {
  const tree = clientGroupsTree.value
  if (tree.length === 1 && tree[0]?.isRoot) return tree[0].children || []
  return tree
})

const selectedGroupIds = computed(() => new Set(form.groups.map((g) => g.value)))

const groupTreeFiltered = computed<GroupTreeNodeData[]>(() => {
  const query = groupSearch.value.trim().toLowerCase()
  if (!query) return rootGroupNodes.value

  const filterNodes = (nodes: GroupTreeNodeData[]): GroupTreeNodeData[] => {
    const result: GroupTreeNodeData[] = []
    for (const node of nodes) {
      const children = node.children?.length ? filterNodes(node.children) : []
      const match =
        node.id.toLowerCase().includes(query) || node.label.toLowerCase().includes(query)
      if (match || children.length > 0) {
        result.push({ ...node, children })
      }
    }
    return result
  }

  return filterNodes(rootGroupNodes.value)
})

const visibleGroupTreeItems = computed<GroupTreeFlatItem[]>(() => {
  const query = groupSearch.value.trim()
  const items: GroupTreeFlatItem[] = []

  const walk = (nodes: GroupTreeNodeData[], level: number) => {
    for (const node of nodes) {
      if (node.isSpecial) continue
      const hasChildren = Boolean(node.children && node.children.length > 0)
      items.push({ id: node.id, label: node.label, level, hasChildren, node })
      const isExpanded = expandedGroupIds.value.has(node.id)
      if ((query || isExpanded) && hasChildren) {
        walk(node.children || [], level + 1)
      }
    }
  }

  walk(groupTreeFiltered.value, 0)
  return items
})

function getDefaultDomainFromDepot(depotId: string): string {
  const idx = depotId.indexOf('.')
  return idx > 0 ? depotId.substring(idx) : '.local'
}

function resetForm() {
  clientName.value = ''
  if (form.depotId) {
    domain.value = getDefaultDomainFromDepot(form.depotId)
  }
  form.description = ''
  form.inventoryNumber = ''
  form.ipAddress = ''
  form.macAddress = ''
  form.notes = ''
  form.agentSetup = false
  form.agentType = 'windows'
  form.agentUsername = ''
  form.agentPassword = ''
  form.netbootProducts = []
  form.groups = []
  formErrors.clientId = ''
  formErrors.depotId = ''
  error.value = null
  success.value = false
}

onMounted(async () => {
  await fetchDepots()
  if (form.depotId) {
    domain.value = getDefaultDomainFromDepot(form.depotId)
  }
  await Promise.all([
    fetchClientIds(),
    fetchNetbootProducts(),
    fetchClientGroups(false, selectionStore.selectedServers),
  ])

  if (rootGroupNodes.value.length > 0) {
    expandedGroupIds.value = new Set(rootGroupNodes.value.map((node) => node.id))
  }
})

async function fetchDepots() {
  loadingDepots.value = true
  try {
    const res = await getServers()
    if (res.data) {
      depots.value = res.data
      if (selectionStore.selectedServers.length > 0 && selectionStore.selectedServers[0]) {
        form.depotId = selectionStore.selectedServers[0]
      } else if (depots.value.length > 0 && depots.value[0]) {
        form.depotId = depots.value[0].depotId
      }
    }
  } catch (e) {
  } finally {
    loadingDepots.value = false
  }
}

async function fetchClientIds() {
  try {
    const depotList = form.depotId ? [form.depotId] : selectionStore.selectedServers || []
    const result = await getClientIds(depotList)
    clientIds.value = result.data || []
  } catch (e) { }
}

async function fetchNetbootProducts() {
  try {
    const depot = form.depotId || selectionStore.selectedServers[0]
    if (depot) {
      const res = await getServersProducts([depot])
      if (res.data && Array.isArray(res.data)) {
        netbootProductOptions.value = res.data.map((item: { productId: string }) => ({
          label: item.productId,
          value: item.productId,
        }))
      }
    }
  } catch (e) { }
}

function toggleGroupSelection(node: GroupTreeNodeData) {
  const current = selectedGroupIds.value
  if (current.has(node.id)) {
    form.groups = form.groups.filter((g) => g.value !== node.id)
    return
  }
  form.groups = [...form.groups, { label: node.label || node.id, value: node.id }]
}

async function toggleGroupExpand(node: GroupTreeNodeData) {
  const next = new Set(expandedGroupIds.value)
  if (next.has(node.id)) {
    next.delete(node.id)
    expandedGroupIds.value = next
    return
  }

  next.add(node.id)
  expandedGroupIds.value = next
  await fetchGroupChildrenLazy(node.id, selectionStore.selectedServers)
}

watch(
  () => form.depotId,
  async (newDepot) => {
    if (newDepot) {
      domain.value = getDefaultDomainFromDepot(newDepot)
      await fetchNetbootProducts()
      await fetchClientIds()
    }
  }
)

watch([clientName, domain], () => {
  formErrors.clientId = ''
  if (!clientName.value) return
  if (Number.isInteger(parseInt(clientName.value.charAt(0)))) {
    formErrors.clientId = $t('clients.validation.noNumber')
    return
  }
  if (clientIds.value.includes(clientName.value + domain.value)) {
    formErrors.clientId = $t('clients.validation.exists')
  }
})

function validateForm(): boolean {
  formErrors.clientId = ''
  formErrors.depotId = ''
  let valid = true

  if (!clientName.value.trim()) {
    formErrors.clientId = String($t('clients.idRequired'))
    valid = false
  } else if (Number.isInteger(parseInt(clientName.value.charAt(0)))) {
    formErrors.clientId = String($t('clients.validation.noNumber'))
    valid = false
  } else if (clientIds.value.includes(clientName.value + domain.value)) {
    formErrors.clientId = String($t('clients.validation.exists'))
    valid = false
  }

  if (!form.depotId) {
    formErrors.depotId = String($t('depot.required'))
    valid = false
  }

  if (form.agentSetup && (!form.agentUsername || !form.agentPassword)) {
    error.value = String($t('clients.credentials.required'))
    valid = false
  }

  return valid
}

async function handleSubmit() {
  error.value = null
  success.value = false

  if (!validateForm()) return

  loading.value = true
  try {
    const hostId = clientName.value + domain.value
    const res = await createClient({
      client: {
        hostId,
        description: form.description.trim() || undefined,
        inventoryNumber: form.inventoryNumber.trim() || undefined,
        hardwareAddress: form.macAddress.trim() || null,
        ipAddress: form.ipAddress.trim() || null,
        notes: form.notes.trim() || null,
      },
      depot: form.depotId,
    })
    if (res.error) throw res.error

    if (form.groups.length > 0) {
      const groupIds = form.groups.map((g) => g.value)
      await addClientToGroups(hostId, groupIds)
    }

    if (form.agentSetup && form.agentUsername && form.agentPassword) {
      await deployClientAgent({
        clients: [hostId],
        username: form.agentUsername,
        password: form.agentPassword,
        type: form.agentType,
      })
    }

    if (form.netbootProducts.length > 0) {
      const productIds = form.netbootProducts.map((p) => p.value)
      await setClientProductActions({
        clientIds: [hostId],
        productIds,
        actionRequest: 'setup',
      })
    }

    success.value = true
    clientIds.value.push(hostId)
    emit('saved')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String($t('clients.create.err'))
  } finally {
    loading.value = false
  }
}
</script>
