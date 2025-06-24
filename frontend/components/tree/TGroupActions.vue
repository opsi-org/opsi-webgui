<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-button @click="refetchGroup" size="small">{{ $t('refresh') }}</el-button>
  <el-popover
    v-if="isProductGroup"
    :placement="popoverPlacement"
    trigger="click"
    :width="popoverWidth"
    @show="loadCreateGroupPopover"
  >
    <template #reference>
      <el-button size="small" :disabled="config.read_only">{{
        $t('createProductGroup')
      }}</el-button>
    </template>
    <template v-if="isCreateGroupPopoverLoaded">
      <el-form label-position="top" class="mt-3">
        <el-text tag="b">{{ $t('createProductGroup') }}</el-text>
        <el-form-item
          v-for="label in Object.keys(createGroup)"
          :key="label"
          :label="$t(label)"
          v-show="label !== 'parentGroupId'"
        >
          <el-input v-model="createGroup[label]" @keyup.enter="createSubGroup('')" />
        </el-form-item>
        <el-button
          class="float-right"
          type="success"
          data-testid="createSubGroup"
          @click="createSubGroup('')"
          :disabled="!createGroup.groupId"
          >{{ $t('create') }}</el-button
        >
      </el-form>
    </template>
  </el-popover>
  <el-container v-loading="isLoading">
    <el-tree
      :ref="props.data.category"
      :class="treeClass"
      :data="fetchedData"
      :props="treeProps"
      node-key="id"
      :expand-on-click-node="false"
      highlight-current
      :default-expanded-keys="!isProductGroup ? firstlevelkeys : undefined"
    >
      <template #default="{ node, data: defdata }">
        <span class="mr-10">{{ node.label }}</span>
        <div class="ml-auto" v-if="node.label !== 'not_assigned'">
          <span :key="node.label + action" v-for="action in getActions(defdata, node)">
            <el-popover
              :placement="popoverPlacement"
              :width="popoverWidth"
              trigger="click"
              :ref="node.label + action"
              @show="loadActionPopover(node.label + action)"
            >
              <template #reference>
                <el-button size="small" :disabled="config.read_only">
                  <IconIIcon
                    v-for="subaction in action.split('-')"
                    :key="subaction"
                    :icon="icons[subaction as keyof typeof icons]"
                  />
                </el-button>
              </template>
              <template v-if="isActionPopoverLoaded[node.label + action]">
                <el-text tag="b" class="text-capitalize after:content-['-']">{{
                  $t(action)
                }}</el-text>
                <el-text tag="i">{{ node.label }}</el-text>
                <el-form label-position="top" class="mt-3">
                  <template v-if="action === 'group-add'">
                    <el-form-item
                      v-for="label in Object.keys(createGroup)"
                      :key="label"
                      :label="$t(label)"
                      v-show="label !== 'parentGroupId'"
                    >
                      <el-input
                        v-model="createGroup[label]"
                        @keyup.enter="createSubGroup(node.label)"
                      />
                    </el-form-item>
                    <el-button
                      class="float-right"
                      type="success"
                      data-testid="createSubGroup"
                      @click="createSubGroup(node.label)"
                      :disabled="!createGroup.groupId || config.read_only"
                      >{{ $t('create') }}</el-button
                    >
                  </template>
                  <template v-else-if="['client-add', 'product-add'].includes(action)">
                    <el-form-item :label="$t('selectChildren')">
                      <el-scrollbar height="300px" class="border w-full p-2 min-w-[300px]">
                        <el-checkbox-group v-model="selectedChildren">
                          <div v-for="item in idList" :key="item">
                            <el-checkbox size="small" :value="item" :label="item" />
                          </div>
                        </el-checkbox-group>
                      </el-scrollbar>
                    </el-form-item>
                    <el-button
                      class="float-right"
                      type="success"
                      data-testid="addChildren"
                      :disabled="config.read_only"
                      @click="addChildren(node.label)"
                      >{{ $t('add') }}</el-button
                    >
                  </template>
                  <template v-else-if="['client-delete', 'product-delete'].includes(action)">
                    <el-text>{{ $t(action + '.confirm') }}</el-text>
                    <el-button
                      class="float-right"
                      type="danger"
                      :disabled="config.read_only"
                      data-testid="removeAssignments"
                      @click="deleteAllChildren(node.label)"
                      >{{ $t('delete') }}</el-button
                    >
                  </template>
                  <template v-else-if="action === 'delete'">
                    <el-text>{{ $t(action + '.confirm') }}</el-text>
                    <el-button
                      type="danger"
                      class="float-right"
                      :disabled="config.read_only"
                      @click="applyDelete(node.label, defdata.type, defdata.parent)"
                      >{{ $t('delete') }}</el-button
                    >
                  </template>
                  <template v-else-if="action === 'edit'">
                    <el-form-item
                      v-for="label in Object.keys(editgroup)"
                      :key="label"
                      :label="$t(label)"
                    >
                      <el-select
                        v-if="label === 'parent'"
                        v-model="editgroup[label]"
                        :teleported="false"
                      >
                        <!-- if item is (nested) child of node. Do not allow -->
                        <el-option
                          v-for="item in filteredGroupNames.filter((name) => {
                            return (
                              name !== node.label &&
                              name !== NOT_ASSIGNED &&
                              !getChildNodes(node).includes(name)
                            )
                          })"
                          :key="item"
                          :label="item"
                          :value="item"
                          :disabled="node.data.parent == item"
                        />
                      </el-select>
                      <el-input v-else v-model="editgroup[label]" />
                    </el-form-item>
                    <el-button
                      class="float-right"
                      type="success"
                      data-testid="editGroup"
                      :disabled="config.read_only"
                      @click="updateGroup(node.label)"
                      >{{ $t('update') }}</el-button
                    >
                  </template>
                  <template v-else-if="action === 'copy'">
                    <el-form-item :label="$t('selectGroupsToCopyClients')">
                      <el-scrollbar height="200px" class="w-100">
                        <el-checkbox-group v-model="selectedGroups">
                          <div v-for="item in filteredGroupNames" :key="item">
                            <el-checkbox size="small" :label="item" :value="item" />
                          </div>
                        </el-checkbox-group>
                      </el-scrollbar>
                    </el-form-item>
                    <el-button
                      type="success"
                      class="float-right"
                      :disabled="config.read_only"
                      @click="copyClient(node.label)"
                      >{{ $t('copy') }}</el-button
                    >
                  </template>
                  <template v-else>{{ $t('message.noAvailableActions') }}</template>
                </el-form>
              </template>
            </el-popover>
          </span>
        </div>
      </template>
    </el-tree>
  </el-container>
</template>

<script setup lang="ts">
  import { useNotification } from '~/composables/mixins/useComponent'
  import { useClient } from '~/composables/mixins/useGet'
  import { useGroup } from '~/composables/mixins/usePost'
  import { useGroupsHelper } from '~/composables/mixins/useGroupsHelper'
  import { debounce } from 'lodash'
  import type { TreeNodeData } from 'element-plus/lib/components/tree/src/tree.type.js'
  import type { T_ClientIds, T_Groups, T_ProductIds, T_Product } from '~/types/APItypes'

  const config = storeConfigapp().config ?? { read_only: true }
  const props = defineProps({ data: { type: Object, required: true } })
  const { notifySuccess, notifyError } = useNotification()
  const icons = useIcons()
  const groupsHelper = useGroupsHelper()
  const mq = useMQ()
  const $t = useI18n().t
  const storeSelection = storeSelections()
  const NOT_ASSIGNED = 'not_assigned' // for i18n check: $t('')
  const cacheChildNode = ref<string>('')
  const cacheChildNodes = ref<string[] | undefined>(undefined) // undefined means not yet fetched

  const isLoading = ref<boolean>(false)
  const fetchedData = ref<Array<any>>([])
  const idList = ref<T_ProductIds | T_ClientIds>([])
  const selectedChildren = ref<Array<any>>([])
  const selectedGroups = ref<Array<any>>([])
  const firstlevelkeys = ref<string[]>([])
  const treeProps = {
    label: 'text',
    children: 'children',
    class: customNodeClass,
  }
  const createGroup = reactive<{ [k: string]: string }>({
    parentGroupId: '', // for i18n check: $t('table.fields.parentGroupId')
    groupId: '', // for i18n check: $t('table.fields.groupId')
    description: '', // for i18n check: $t('table.fields.description')
    notes: '', // for i18n check: $t('table.fields.notes')
  })
  const editgroup = reactive<{ [k: string]: string }>({
    parent: '', // for i18n check: $t('table.fields.parent')
    description: '', // for i18n check: $t('table.fields.description')
    notes: '', // for i18n check: $t('table.fields.notes')
  })

  const debouncedFetchClientGroups = debounce(fetchClientGroups, 300)
  const debouncedFetchProdGroups = debounce(fetchProdGroups, 300)

  const isCreateGroupPopoverLoaded = ref(false)
  const isActionPopoverLoaded = reactive<{ [key: string]: boolean }>({})

  watch(
    () => storeSelection.selectionDepots,
    async (newVal, oldVal) => {
      if (newVal !== oldVal) {
        await debouncedFetchClientGroups()
        await fetchClientList()
      }
    }
  )

  onMounted(async () => {
    isLoading.value = true
    if (props.data.category === 'client-group') {
      await debouncedFetchClientGroups()
      await fetchClientList()
    } else {
      await debouncedFetchProdGroups()
      await fetchProductList()
    }
    isLoading.value = false
  })

  const isProductGroup = computed(() => props.data.category === 'product-group')
  const popoverPlacement = computed(() => (mq.isMobile.value ? 'auto' : 'right'))
  const popoverWidth = computed(() => (mq.isMobile.value ? '100%' : '360px'))
  const treeClass = computed(() => (mq.isMobile.value ? 'w-100' : 'w-50'))

  const filteredGroupNames = computed(() => {
    // search nested for all group names
    const groupNames: string[] = []
    searchForAttribute(fetchedData.value, 'type', 'HostGroup', 'text', groupNames)
    searchForAttribute(fetchedData.value, 'type', 'ProductGroup', 'text', groupNames)
    return groupNames
  })
  function searchForAttribute(
    data: Array<any>,
    attribute: string,
    value: any,
    returnAttribute: string,
    result: Array<string>
  ) {
    for (const item of data) {
      if (item[attribute] === value) {
        result.push(item[returnAttribute])
      }
      if (item.children) {
        searchForAttribute(item.children, attribute, value, returnAttribute, result)
      }
    }
  }
  function getChildNodes(node: any): string[] {
    if (cacheChildNode.value === node.label && cacheChildNodes.value !== undefined) {
      return cacheChildNodes.value
    }
    cacheChildNode.value = node.label
    cacheChildNodes.value = groupsHelper.getChildrenLabels(node)
    return cacheChildNodes.value
  }

  function customNodeClass({ children, type }: TreeNodeData) {
    const isGroup = type != 'ObjectToGroup'
    let cclass = ''
    cclass += isGroup ? ' isGroup ' : ' isLeaf '
    cclass += !isGroup || children?.length > 0 ? ' ' : ' isEmpty '
    return cclass
  }
  function loadCreateGroupPopover() {
    isCreateGroupPopoverLoaded.value = true
  }

  function loadActionPopover(actionKey: string) {
    isActionPopoverLoaded[actionKey] = true
  }

  async function refetchGroup() {
    if (props.data.category === 'client-group') {
      await fetchClientGroups()
    } else {
      await fetchProdGroups()
    }
    cacheChildNode.value = ''
    cacheChildNodes.value = undefined
  }

  async function fetchClientGroups() {
    try {
      const { data, error } = await useApiGETBody<Record<string, T_Groups>>(
        `/opsidata/hosts/groups?selectedDepots=${storeSelection.selectionDepots}`
      )
      if (error) throw new Error(error?.response?.data?.message || 'Unknown error')
      if (!data.value)
        throw new Error(
          $t('message.error.emptyResponse', {
            details: 'ClientGroupSelections',
          })
        )
      fetchedData.value = groupsHelper.transformToNestedArray(data.value)
      firstlevelkeys.value = Object.values(data.value).map((item) => item.id)
    } catch (err) {
      notifyError({ message: (err as Error).message })
    }
  }

  async function fetchClientList() {
    idList.value = await useClient().getClientIdList(storeSelection.selectionDepots)
  }

  async function fetchProdGroups() {
    try {
      const { data, error } = await useApiGETBody<Record<string, Record<string, T_Groups>>>(
        `/opsidata/products/groups?selectedProducts=${storeSelection.selectionProducts}`
      )
      if (error) throw new Error(error?.response?.data?.message || 'Unknown error')
      if (!data.value)
        throw new Error($t('message.error.emptyResponse', { details: 'GroupActions' }))
      fetchedData.value = groupsHelper.transformToNestedArray(data.value.groups.children)
    } catch (err) {
      notifyError({ message: (err as Error).message })
    }
  }

  async function fetchProductList() {
    try {
      const { data, error } = await useApiGETBody<Array<T_Product>>(
        `/opsidata/depots/products?productType=LocalbootProduct&selectedDepots=[${storeSelection.selectionDepots}]`
      )
      if (error) throw new Error(error?.response?.data?.message || 'Unknown error')
      if (!data.value)
        throw new Error($t('message.error.emptyResponse', { details: 'GroupActions' }))
      idList.value = data.value.map((item) => item.productId)
    } catch (err) {
      console.error('Error fetching product list:', err)
      notifyError({ message: (err as Error).message })
    }
  }

  async function createSubGroup(parent: string) {
    createGroup.parentGroupId = parent
    const url =
      props.data.category === 'client-group'
        ? '/opsidata/hosts/groups'
        : '/opsidata/products/groups'
    try {
      const { error } = await useApiPOST(url, createGroup)
      if (error) throw new Error(error?.response?.data?.message || 'Unknown error')
      notifySuccess({
        message: $t('message.successfullyCreatedGroup', {
          group: createGroup.groupId,
        }),
      })
      await refetchGroup()
    } catch (err) {
      notifyError({ message: (err as Error).message })
    }
  }

  async function addChildren(selectedGroup: string) {
    const url =
      props.data.category === 'client-group'
        ? `/opsidata/hosts/groups/${selectedGroup}/clients`
        : `/opsidata/products/groups/${selectedGroup}/products`
    try {
      const { error } = await useApiPOST(url, selectedChildren.value)
      if (error) throw new Error(error?.response?.data?.message || 'Unknown error')
      notifySuccess({
        message: $t('message.successfullyAddedClientsToGroup', {
          group: selectedGroup,
        }),
      })
      await refetchGroup()
    } catch (err) {
      notifyError({ message: (err as Error).message })
    }
  }

  async function deleteAllChildren(selectedGroup: string) {
    const url =
      props.data.category === 'client-group'
        ? `/opsidata/hosts/groups/${selectedGroup}/clients`
        : `/opsidata/products/groups/${selectedGroup}/products`
    try {
      const { error } = await useApiDELETE(url)
      if (error) throw new Error(error?.response?.data?.message || 'Unknown error')
      notifySuccess({
        message: $t('message.successfullyDeletedClientFromGroup', {
          group: selectedGroup,
        }),
      })
      await refetchGroup()
    } catch (err) {
      notifyError({ message: (err as Error).message })
    }
  }

  async function applyDelete(selectedNode: string, nodeType: string, parent: string) {
    if (nodeType === 'ObjectToGroup') {
      await deleteObjectToGroup(selectedNode, parent)
    } else {
      await deleteGroup(selectedNode)
    }
  }

  async function deleteGroup(selectedGroup: string) {
    const url =
      props.data.category === 'client-group'
        ? `/opsidata/hosts/groups/${selectedGroup}`
        : `/opsidata/products/groups/${selectedGroup}`
    try {
      const { error } =
        props.data.category === 'client-group' ? await useApiDELETE(url) : await useApiGET(url)
      if (error) throw new Error(error?.response?.data?.message || 'Unknown error')
      notifySuccess({
        message: $t('message.successfullyDeletedGroup', {
          group: selectedGroup,
        }),
      })
      await refetchGroup()
    } catch (err) {
      notifyError({ message: (err as Error).message })
    }
  }

  async function deleteObjectToGroup(selectedChild: string, parent: string) {
    const url =
      props.data.category === 'client-group'
        ? `/opsidata/clients/${selectedChild}/groups`
        : `/opsidata/products/groups/${parent}/${selectedChild}`
    const body = props.data.category === 'client-group' ? [parent] : {}
    try {
      const { error } = await useApiDELETE(url, body)
      if (error) throw new Error(error?.response?.data?.message || 'Unknown error')
      notifySuccess({
        message: $t('message.successfullyDeletedClientFromGroup', {
          client: selectedChild,
        }),
      })
      await refetchGroup()
    } catch (err) {
      notifyError({ message: (err as Error).message })
    }
  }

  async function updateGroup(selectedGroup: string) {
    const url =
      props.data.category === 'client-group'
        ? `/opsidata/hosts/groups/${selectedGroup}`
        : `/opsidata/products/groups/${selectedGroup}`
    try {
      const { error } = await useApiPUT(url, editgroup)
      if (error) throw new Error(error?.response?.data?.message || 'Unknown error')
      notifySuccess({
        message: $t('message.successfullyUpdatedGroup', {
          group: selectedGroup,
        }),
      })

      await refetchGroup()
    } catch (err) {
      notifyError({ message: (err as Error).message })
    }
  }

  async function copyClient(selectedClient: string) {
    await useGroup($t).addClientToListOfGroups(selectedClient, selectedGroups.value)
    await refetchGroup()
  }

  function getActions(defdata: any, node: any) {
    if (defdata.type === 'ObjectToGroup') {
      return props.data.actions.children
    } else if (node.label === 'groups' || node.label === 'clientdirectory') {
      return props.data.actions.maingroups
    } else {
      return props.data.actions.parent
    }
  }
</script>
<style scoped lang="css">
  :deep(.el-tree__empty-text) {
    position: relative !important;
  }
  :deep(.el-tree-node.isEmpty) {
    color: var(--color-opsi-medium-gray) !important;
  }
</style>
