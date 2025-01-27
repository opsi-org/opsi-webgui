<template>
  <el-button @click="refetchGroup" size="small">{{
    $t('label.refresh')
  }}</el-button>
  <el-popover
    v-if="isProductGroup"
    :placement="popoverPlacement"
    trigger="click"
    :width="popoverWidth"
    @show="loadCreateGroupPopover"
  >
    <template #reference>
      <el-button size="small" :disabled="config.read_only">{{
        $t('label.create.prodgroup')
      }}</el-button>
    </template>
    <template v-if="isCreateGroupPopoverLoaded">
      <el-form label-position="top" class="mt-3">
        <el-text tag="b">{{ $t('label.create.prodgroup') }}</el-text>
        <el-form-item
          v-for="label in Object.keys(createGroup)"
          :key="label"
          :label="$t('table.fields.' + label)"
          v-show="label !== 'parentGroupId'"
        >
          <el-input
            v-model="createGroup[label]"
            @keyup.enter="createSubGroup('')"
          />
        </el-form-item>
        <el-button
          class="float-right"
          type="success"
          data-testid="createSubGroup"
          @click="createSubGroup('')"
          :disabled="!createGroup.groupId"
          >{{ $t('button.create') }}</el-button
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
        <span>{{ node.label }}</span>
        <div class="ml-auto" v-if="node.label !== 'not_assigned'">
          <span
            :key="node.label + action"
            v-for="action in getActions(defdata, node)"
          >
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
                  $t('group.' + action)
                }}</el-text>
                <el-text tag="i">{{ node.label }}</el-text>
                <el-form label-position="top" class="mt-3">
                  <template v-if="action === 'group-add'">
                    <el-form-item
                      v-for="label in Object.keys(createGroup)"
                      :key="label"
                      :label="$t('table.fields.' + label)"
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
                      >{{ $t('button.create') }}</el-button
                    >
                  </template>
                  <template
                    v-else-if="['client-add', 'product-add'].includes(action)"
                  >
                    <el-form-item :label="$t('label.selectChildren')">
                      <el-scrollbar
                        height="300px"
                        class="border w-full p-2 min-w-[300px]"
                      >
                        <el-checkbox-group v-model="selectedChildren">
                          <div v-for="item in idList" :key="item">
                            <el-checkbox
                              size="small"
                              :value="item"
                              :label="item"
                            />
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
                      >{{ $t('button.add') }}</el-button
                    >
                  </template>
                  <template
                    v-else-if="
                      ['client-delete', 'product-delete'].includes(action)
                    "
                  >
                    <el-text>{{ $t('group.confirm.' + action) }}</el-text>
                    <el-button
                      class="float-right"
                      type="danger"
                      :disabled="config.read_only"
                      data-testid="removeAssignments"
                      @click="deleteAllChildren(node.label)"
                      >{{ $t('button.delete') }}</el-button
                    >
                  </template>
                  <template v-else-if="action === 'delete'">
                    <el-text>{{ $t('group.confirm.' + action) }}</el-text>
                    <el-button
                      type="danger"
                      class="float-right"
                      :disabled="config.read_only"
                      @click="
                        applyDelete(node.label, defdata.type, defdata.parent)
                      "
                      >{{ $t('button.delete') }}</el-button
                    >
                  </template>
                  <template v-else-if="action === 'edit'">
                    <el-form-item
                      v-for="label in Object.keys(editgroup)"
                      :key="label"
                      :label="$t('table.fields.' + label)"
                    >
                      <el-select
                        v-if="label === 'parent'"
                        v-model="editgroup[label]"
                      >
                        <el-option
                          v-for="item in filteredGroupNames"
                          :key="item"
                          :label="item"
                          :value="item"
                        />
                      </el-select>
                      <el-input v-else v-model="editgroup[label]" />
                    </el-form-item>
                    <el-button
                      class="float-right"
                      type="success"
                      data-testid="editGroup"
                      :disabled="config.read_only"
                      @click="editGroup(node.label)"
                      >{{ $t('button.update') }}</el-button
                    >
                  </template>
                  <template v-else-if="action === 'copy'">
                    <el-form-item :label="$t('group.copyClient.selectgroup')">
                      <el-scrollbar height="200px" class="w-100">
                        <el-checkbox-group v-model="selectedGroups">
                          <div v-for="item in filteredGroupNames" :key="item">
                            <el-checkbox
                              size="small"
                              :label="item"
                              :value="item"
                            />
                          </div>
                        </el-checkbox-group>
                      </el-scrollbar>
                    </el-form-item>
                    <el-button
                      type="success"
                      class="float-right"
                      :disabled="config.read_only"
                      @click="copyClient(node.label)"
                      >{{ $t('button.copy') }}</el-button
                    >
                  </template>
                  <template v-else>{{ $t('group.noactions') }}</template>
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
  import type {
    T_ClientIds,
    T_Groups,
    T_ProductIds,
    T_Product,
  } from '~/types/APItypes'

  const config = storeConfigapp().config ?? { read_only: true }
  const props = defineProps({ data: { type: Object, required: true } })
  const { notifySuccess, notifyError } = useNotification()
  const icons = useIcons()
  const groupsHelper = useGroupsHelper()
  const mq = useMQ()
  const $t = useI18n().t
  const storeSelection = storeSelections()

  const isLoading = ref<boolean>(false)
  const fetchedData = ref<Array<any>>([])
  const idList = ref<T_ProductIds | T_ClientIds>([])
  const selectedChildren = ref<Array<any>>([])
  const selectedGroups = ref<Array<any>>([])
  const firstlevelkeys = ref<string[]>([])
  const treeProps = { label: 'text', children: 'children' }
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
    },
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
  const popoverPlacement = computed(() =>
    mq.isMobile.value ? 'auto' : 'right',
  )
  const popoverWidth = computed(() => (mq.isMobile.value ? '100%' : '360px'))
  const treeClass = computed(() => (mq.isMobile.value ? 'w-100' : 'w-50'))

  const filteredGroupNames = computed(() => {
    // search nested for all group names
    const groupNames: string[] = []
    searchForAttribute(
      fetchedData.value,
      'type',
      'HostGroup',
      'text',
      groupNames,
    )
    searchForAttribute(
      fetchedData.value,
      'type',
      'ProductGroup',
      'text',
      groupNames,
    )
    return groupNames
  })
  function searchForAttribute(
    data: Array<any>,
    attribute: string,
    value: any,
    returnAttribute: string,
    result: Array<string>,
  ) {
    for (const item of data) {
      if (item[attribute] === value) {
        result.push(item[returnAttribute])
      }
      if (item.children) {
        searchForAttribute(
          item.children,
          attribute,
          value,
          returnAttribute,
          result,
        )
      }
    }
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
  }

  async function fetchClientGroups() {
    try {
      const { data, error } = await useApiGETBody<Record<string, T_Groups>>(
        `/opsidata/hosts/groups?selectedDepots=${storeSelection.selectionDepots}`,
      )
      if (error)
        throw new Error(error?.response?.data?.message || 'Unknown error')
      if (!data.value)
        throw new Error(
          $t('message.error.empty-response', {
            details: 'ClientGroupSelections',
          }),
        )
      fetchedData.value = groupsHelper.transformToNestedArray(data.value)
      firstlevelkeys.value = Object.values(data.value).map((item) => item.id)
    } catch (err) {
      notifyError({ message: (err as Error).message })
    }
  }

  async function fetchClientList() {
    idList.value = await useClient().getClientIdList(
      storeSelection.selectionDepots,
    )
  }

  async function fetchProdGroups() {
    try {
      const { data, error } = await useApiGETBody<
        Record<string, Record<string, T_Groups>>
      >(
        `/opsidata/products/groups?selectedProducts=${storeSelection.selectionProducts}`,
      )
      if (error)
        throw new Error(error?.response?.data?.message || 'Unknown error')
      if (!data.value)
        throw new Error(
          $t('message.error.empty-response', { details: 'GroupActions' }),
        )
      fetchedData.value = groupsHelper.transformToNestedArray(data.value.groups)
    } catch (err) {
      notifyError({ message: (err as Error).message })
    }
  }

  async function fetchProductList() {
    try {
      const { data, error } = await useApiGETBody<Array<T_Product>>(
        `/opsidata/depots/products?productType=LocalbootProduct&selectedDepots=[${storeSelection.selectionDepots}]`,
      )
      if (error)
        throw new Error(error?.response?.data?.message || 'Unknown error')
      if (!data.value)
        throw new Error(
          $t('message.error.empty-response', { details: 'GroupActions' }),
        )
      idList.value = data.value.map((item) => item.productId)
    } catch (err) {
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
      if (error)
        throw new Error(error?.response?.data?.message || 'Unknown error')
      notifySuccess({
        message: $t('message.success.save.create.group', {
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
      if (error)
        throw new Error(error?.response?.data?.message || 'Unknown error')
      notifySuccess({
        message: $t('message.success.save.add.clientfromgroups', {
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
      if (error)
        throw new Error(error?.response?.data?.message || 'Unknown error')
      notifySuccess({
        message: $t('message.success.save.delete.clientfromgroups', {
          group: selectedGroup,
        }),
      })
      await refetchGroup()
    } catch (err) {
      notifyError({ message: (err as Error).message })
    }
  }

  async function applyDelete(
    selectedNode: string,
    nodeType: string,
    parent: string,
  ) {
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
        props.data.category === 'client-group'
          ? await useApiDELETE(url)
          : await useApiGET(url)
      if (error)
        throw new Error(error?.response?.data?.message || 'Unknown error')
      notifySuccess({
        message: $t('message.success.save.delete.group', {
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
      if (error)
        throw new Error(error?.response?.data?.message || 'Unknown error')
      notifySuccess({
        message: $t('message.success.save.delete.clientfromgroups', {
          client: selectedChild,
        }),
      })
      await refetchGroup()
    } catch (err) {
      notifyError({ message: (err as Error).message })
    }
  }

  async function editGroup(selectedGroup: string) {
    const url =
      props.data.category === 'client-group'
        ? `/opsidata/hosts/groups/${selectedGroup}`
        : `/opsidata/products/groups/${selectedGroup}`
    try {
      const { error } = await useApiPUT(url, editgroup)
      if (error)
        throw new Error(error?.response?.data?.message || 'Unknown error')
      notifySuccess({
        message: $t('message.success.save.update.group', {
          group: selectedGroup,
        }),
      })
      await refetchGroup()
    } catch (err) {
      notifyError({ message: (err as Error).message })
    }
  }

  async function copyClient(selectedClient: string) {
    await useGroup($t).addClientToListOfGroups(
      selectedClient,
      selectedGroups.value,
    )
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
