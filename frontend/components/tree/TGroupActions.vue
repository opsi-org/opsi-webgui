<template>
  <el-button @click="refetchGroup" size="small"> {{ $t('label.refresh') }}</el-button>
  <el-popover
    v-if="props.data.category == 'product-group'"
    :placement="mq.isMobile.value ? 'auto' : 'right'"
    trigger="click"
    :width="mq.isMobile.value ? '100%' : '360px'"
  >
    <template #reference>
      <el-button size="small">{{ $t('label.create.prodgroup') }} </el-button>
    </template>
    <el-form label-position="top" class="mt-3">
      <el-form-item
        v-for="label in Object.keys(createGroup)"
        :key="label"
        :label="$t('table.fields.' + label)"
        :class="{ 'd-none': label.toString() == 'parentGroupId' }"
      >
        <el-input
          v-model="createGroup[label]"
          @keyup.enter="createGroup.groupId != '' && createSubGroup('')"
        />
      </el-form-item>
      <el-button
        class="float-right"
        type="success"
        data-testid="createSubGroup"
        @click="createSubGroup('')"
        :disabled="createGroup.groupId == ''"
      >
        {{ $t('button.create') }}
      </el-button>
    </el-form>
  </el-popover>
  <el-container v-loading="isLoading">
    <el-tree
      :ref="props.data.category"
      :class="mq.isMobile.value ? 'w-100' : 'w-50'"
      :data="fetchedData"
      :props="treeProps"
      node-key="id"
      :expand-on-click-node="false"
      highlight-current
    >
      <template #default="{ node, data: defdata }">
        <span>{{ node.label }}</span>
        <div class="ml-auto" v-if="node.label !== 'not_assigned'">
          <span
            :key="node.label + action"
            v-for="action in defdata.type == 'ObjectToGroup'
              ? props.data.actions.children
              : node.label == 'groups' || node.label == 'clientdirectory'
                ? props.data.actions.maingroups
                : props.data.actions.parent"
          >
            <el-popover
              :placement="mq.isMobile.value ? 'auto' : 'right'"
              :width="mq.isMobile.value ? '100%' : '360px'"
              trigger="click"
              :ref="node.label + action"
            >
              <template #reference>
                <el-button size="small">
                  <IconIIcon
                    v-for="subaction in action.split('-')"
                    :key="subaction"
                    :icon="icons[subaction as keyof typeof icons]"
                  />
                </el-button>
              </template>
              <el-text tag="b">{{ $t('group.' + action) }}</el-text> -
              <el-text tag="i">{{ node.label }}</el-text>
              <el-form label-position="top" class="mt-3">
                <template v-if="action == 'group-add'">
                  <el-form-item
                    v-for="label in Object.keys(createGroup)"
                    :key="label"
                    :label="$t('table.fields.' + label)"
                    :class="{ 'd-none': label.toString() == 'parentGroupId' }"
                  >
                    <el-input
                      v-model="createGroup[label]"
                      @keyup.enter="createGroup.groupId != '' && createSubGroup(node.label)"
                    />
                  </el-form-item>
                  <el-button
                    class="float-right"
                    type="success"
                    data-testid="createSubGroup"
                    @click="createSubGroup(node.label)"
                    :disabled="createGroup.groupId == ''"
                  >
                    {{ $t('button.create') }}
                  </el-button>
                </template>
                <template v-else-if="action == 'client-add' || action == 'product-add'">
                  <el-form-item :label="$t('label.selectChildren')">
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
                    @click="addChildren(node.label)"
                  >
                    {{ $t('button.add') }}
                  </el-button>
                </template>
                <template v-else-if="action == 'client-delete' || action == 'product-delete'">
                  <el-text> {{ $t('group.confirm.' + action) }} </el-text>
                  <el-button
                    class="float-right"
                    type="danger"
                    data-testid="removeAssignments"
                    @click="deleteAllChildren(node.label)"
                  >
                    {{ $t('button.delete') }}
                  </el-button>
                </template>
                <template v-else-if="action == 'delete'">
                  <el-text>{{ $t('group.confirm.' + action) }}</el-text>
                  <el-button
                    type="danger"
                    class="float-right"
                    @click="applyDelete(node.label, data.type, data.parent)"
                  >
                    {{ $t('button.delete') }}
                  </el-button>
                </template>
                <template v-else-if="action == 'edit'">
                  <el-form-item
                    v-for="label in Object.keys(editgroup)"
                    :key="label"
                    :label="$t('table.fields.' + label)"
                  >
                    <!-- TODO: Backend: return list of groups -->
                    <el-select v-if="label.toString() == 'parent'" v-model="editgroup[label]">
                      <el-option
                        v-for="item in fetchedData
                          .filter((item: any) => item.type !== 'ObjectToGroup')
                          .map((item: any) => item.text)"
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
                    @click="editGroup(node.label)"
                  >
                    {{ $t('button.update') }}
                  </el-button>
                </template>
                <template v-else-if="action == 'copy'">
                  <el-form-item :label="$t('group.copyClient.selectgroup')">
                    <el-scrollbar height="200px" class="border w-100">
                      <!-- TODO: Backend: return list of groups -->
                      <el-checkbox-group v-model="selectedGroups">
                        <div
                          v-for="item in fetchedData
                            .filter((item: any) => item.type !== 'ObjectToGroup')
                            .map((item: any) => item.text)"
                          :key="item"
                        >
                          <el-checkbox size="small" :value="item" />
                        </div>
                      </el-checkbox-group>
                    </el-scrollbar>
                  </el-form-item>
                  <el-button type="success" class="float-right" @click="copyClient(node.label)">
                    {{ $t('button.copy') }}
                  </el-button>
                </template>
                <template v-else> No action available </template>
              </el-form>
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
  import { useIcons } from '../../composables/mixins/useIcons'
  import type { T_ClientIds, T_Groups, T_ProductIds, T_Product } from '~/types/APItypes'
  import { debounce } from 'lodash'

  const props = defineProps({
    data: { type: Object, required: true },
  })

  const { notifySuccess, notifyError } = useNotification()
  const icons = useIcons()
  const groupsHelper = useGroupsHelper()
  const mq = useMQ()
  const $t = useI18n().t
  const storeSelection: any = storeSelections()

  const isLoading = ref<boolean>(false)
  const fetchedData = ref<Array<any>>([])
  const idList = ref<T_ProductIds | T_ClientIds>([])
  const selectedChildren = ref<Array<any>>([])
  const selectedGroups = ref<Array<any>>([])

  const treeProps = {
    label: 'text',
    children: 'children',
  }

  const createGroup = reactive<{ [k: string]: string }>({
    parentGroupId: '',
    groupId: '',
    description: '',
    notes: '',
  })

  const editgroup = reactive<{ [k: string]: string }>({
    parent: '',
    description: '',
    notes: '',
  })

  const debouncedFetchClientGroups = debounce(fetchClientGroups, 300)
  const debouncedFetchProdGroups = debounce(fetchProdGroups, 300)

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

  async function refetchGroup() {
    if (props.data.category == 'client-group') {
      await fetchClientGroups()
    } else {
      await fetchProdGroups()
    }
  }

  async function fetchClientGroups() {
    try {
      const { data, error } = await useApiGETBody<Record<string, T_Groups>>(
        `/opsidata/hosts/groups?selectedDepots=${storeSelection.selectionDepots}`
      )
      if (error) {
        throw new Error(error?.response?.data?.message || 'Unknown error')
      }
      if (!data.value) {
        throw new Error($t('message.error.empty-response', { details: 'ClientGroupSelections' }))
      }
      fetchedData.value = groupsHelper.transformToNestedArray(data.value)
    } catch (err) {
      notifyError({ message: err })
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
      if (error) {
        throw new Error(error?.response?.data?.message || 'Unknown error')
      }
      if (!data.value) {
        throw new Error($t('message.error.empty-response', { details: 'GroupActions' }))
      }
      const groups = data.value['groups']
      fetchedData.value = groupsHelper.transformToNestedArray(groups)
    } catch (err) {
      notifyError({ message: err })
    }
  }

  async function fetchProductList() {
    try {
      const { data, error } = await useApiGETBody<Array<T_Product>>(
        `/opsidata/depots/products?productType=LocalbootProduct&selectedDepots=[${storeSelection.selectionDepots}]`
      )
      if (error) {
        throw new Error(error?.response?.data?.message || 'Unknown error')
      }
      if (!data.value) {
        throw new Error($t('message.error.empty-response', { details: 'GroupActions' }))
      }
      idList.value = data.value.map((item: { productId: any }) => item.productId)
    } catch (err) {
      notifyError({ message: err })
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
      if (error) {
        throw new Error(error?.response?.data?.message || 'Unknown error')
      }
      notifySuccess({
        message: $t('message.success.save.create.group', { group: createGroup.groupId }),
      })
      await refetchGroup()
    } catch (err) {
      notifyError({ message: err })
    }
  }

  async function addChildren(selectedGroup: string) {
    const url =
      props.data.category === 'client-group'
        ? `/opsidata/hosts/groups/${selectedGroup}/clients`
        : `/opsidata/products/groups/${selectedGroup}/products`

    try {
      const { error } = await useApiPOST(url, selectedChildren.value)
      if (error) {
        throw new Error(error?.response?.data?.message || 'Unknown error')
      }
      notifySuccess({
        message: $t('message.success.save.add.clientfromgroups', { group: selectedGroup }),
      })
      await refetchGroup()
    } catch (err) {
      notifyError({ message: err })
    }
  }

  async function deleteAllChildren(selectedGroup: string) {
    const url =
      props.data.category === 'client-group'
        ? `/opsidata/hosts/groups/${selectedGroup}/clients`
        : `/opsidata/products/groups/${selectedGroup}/products`

    try {
      const { error } = await useApiDELETE(url)
      if (error) {
        throw new Error(error?.response?.data?.message || 'Unknown error')
      }
      notifySuccess({
        message: $t('message.success.save.delete.clientfromgroups', { group: selectedGroup }),
      })
      await refetchGroup()
    } catch (err) {
      notifyError({ message: err })
    }
  }

  async function applyDelete(selectedNode: string, nodeType: string, parent: string) {
    if (nodeType == 'ObjectToGroup') {
      deleteObjectToGroup(selectedNode, parent)
    } else {
      deleteGroup(selectedNode)
    }
  }

  async function deleteGroup(selectedGroup: string) {
    const url =
      props.data.category === 'client-group'
        ? `/opsidata/hosts/groups/${selectedGroup}`
        : `/opsidata/products/groups/${selectedGroup}`

    try {
      // TODO: Backend: change product group deletion to DELETE
      const { error } =
        props.data.category === 'client-group' ? await useApiDELETE(url) : await useApiGET(url)

      if (error) {
        throw new Error(error?.response?.data?.message || 'Unknown error')
      }

      notifySuccess({
        message: $t('message.success.save.delete.group', { group: selectedGroup }),
      })
      await refetchGroup()
    } catch (err) {
      notifyError({ message: err })
    }
  }

  async function deleteObjectToGroup(selectedChild: string, parent: string) {
    // TODO: Backend: Change the client deletion URL in the same way as product deletion from group
    const url =
      props.data.category === 'client-group'
        ? `/opsidata/clients/${selectedChild}/groups`
        : `/opsidata/products/groups/${parent}/${selectedChild}`
    const body = props.data.category === 'client-group' ? [parent] : {}

    try {
      const { error } = await useApiDELETE(url, body)
      if (error) {
        throw new Error(error?.response?.data?.message || 'Unknown error')
      }
      notifySuccess({
        message: $t('message.success.save.delete.clientfromgroups', { client: selectedChild }),
      })
      await refetchGroup()
    } catch (err) {
      notifyError({ message: err })
    }
  }

  async function editGroup(selectedGroup: string) {
    const url =
      props.data.category === 'client-group'
        ? `/opsidata/hosts/groups/${selectedGroup}`
        : `/opsidata/products/groups/${selectedGroup}`

    try {
      const { error } = await useApiPUT(url, editgroup)
      if (error) {
        throw new Error(error?.response?.data?.message || 'Unknown error')
      }
      notifySuccess({
        message: $t('message.success.save.update.group', { group: selectedGroup }),
      })
      await refetchGroup()
    } catch (err) {
      notifyError({ message: err })
    }
  }

  async function copyClient(selectedClient: string) {
    await useGroup($t).addClientToListOfGroups(selectedClient, selectedGroups.value)
    await refetchGroup()
  }
</script>
