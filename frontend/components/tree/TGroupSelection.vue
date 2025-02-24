<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div class="flex justify-between items-center">
    <p-button
      :disabled="
        props.grouptype == GroupTree_CLIENTGROUP
          ? selectionClients.length <= 0
          : selectionProducts.length <= 0
      "
      @click="clearSelection"
      size="small"
      severity="primary"
      variant="outlined"
      :label="$t('table.selection.clear')"
    />
    <IconILoading v-if="isLoadingSelection" small />
  </div>
  <el-tree
    :ref="
      props.grouptype == GroupTree_CLIENTGROUP
        ? 'clientGroupRef'
        : 'prodGroupRef'
    "
    v-loading="isLoading"
    :data="fetchedData"
    :props="defaultProps"
    :class="multiSelection ? 'isMultiSelect' : 'isSingleSelect'"
    node-key="id"
    show-checkbox
    :default-expanded-keys="
      props.grouptype == GroupTree_CLIENTGROUP ? firstlevelkeys : undefined
    "
    highlight-current
    @check="handleClickCheckbox"
    @node-click="handleClickText"
  >
    <!-- :class="multiSelection ? 'isMultiSelect' : 'isSingleSelect'" -->
    <!-- :show-checkbox="selectionStore.multiSelection" -->
    <!-- default-expand-all -->
    <template #default="{ data }">
      <p-radio-button
        v-if="!multiSelection && data.type == 'ObjectToGroup'"
        :label="data.text"
        :value="data.text"
        size="small"
        class="mb-1 mr-1"
        name="rb-tree-item"
        :input-id="'rb-item-' + data.id"
        v-model="selectedItem"
      />
      <!--
        @change="handleClickCheckbox(data, $event)" -->
      <span :for="'rb-item-' + data.id" class="ml-1"> {{ data.text }} </span>
    </template>
  </el-tree>
</template>

<script setup lang="ts">
  import { ElTree } from 'element-plus'
  import { useNotification } from '~/composables/mixins/useComponent'
  import { useGroupsHelper } from '~/composables/mixins/useGroupsHelper'
  import type { T_Groups } from '~/types/APItypes'
  import type { TreeNodeData } from 'element-plus/lib/components/tree/src/tree.type.js'
  import {
    GroupTree_CLIENTGROUP,
    type PropTypeGroupTree,
  } from '~/types/tproptypes'

  const { notifyError } = useNotification()
  const $t = useI18n().t
  const groupsHelper = useGroupsHelper()
  const useCookie = storeTablesettings()
  const props = defineProps({
    grouptype: { type: String as PropType<PropTypeGroupTree>, required: true },
  })

  const isLoading = ref(false)
  const isLoadingSelection = ref(false)
  const clientGroupRef = ref<InstanceType<typeof ElTree>>()
  const prodGroupRef = ref<InstanceType<typeof ElTree>>()
  const firstlevelkeys = ref<string[]>([])

  const defaultProps = {
    label: 'text',
    children: 'children',
    class: customNodeClass,
  }
  const fetchedData = ref<any>([])
  const selectionStore = storeSelections()
  const {
    selectionDepots,
    selectionClients,
    selectionProducts,
    multiSelection,
  } = storeToRefs(selectionStore)
  const selectedItem = ref<string>(
    multiSelection.value
      ? ''
      : props.grouptype == GroupTree_CLIENTGROUP
        ? selectionClients.value[0]
        : selectionProducts.value[0],
  )

  onMounted(async () => {
    isLoading.value = true
    if (props.grouptype == GroupTree_CLIENTGROUP) {
      await fetchClientGroups()
    } else {
      await fetchProdGroups()
    }
    syncSelection()
    isLoading.value = false
  })
  watch(
    () => multiSelection.value,
    () => {
      // go through all groups and reset disabled
      const recursive = (data: any) => {
        data.forEach((node: any) => {
          const nodeIsLeaf = node.type === 'ObjectToGroup'
          // !node.children || Object.keys(node.children).length === 0
          if (!nodeIsLeaf) {
            node.disabled = !multiSelection.value
            recursive(node.children)
          }
        })
      }
      recursive(fetchedData.value)
    },
  )
  watch(
    () => selectedItem.value,
    (val) => {
      if (val) {
        if (props.grouptype == GroupTree_CLIENTGROUP) {
          selectionStore.setSelectionClients([val])
        } else {
          selectionStore.setSelectionProducts([val])
        }
      }
    },
  )
  watch(() => selectionClients.value, syncSelection, { deep: true })
  watch(() => selectionProducts.value, syncSelection, { deep: true })
  function customNodeClass({ children, type }: TreeNodeData) {
    const isGroup = type != 'ObjectToGroup'
    let cclass = ''
    cclass += isGroup ? ' isGroup ' : ' isLeaf '
    cclass += !isGroup || children?.length > 0 ? ' ' : ' isEmpty '
    return cclass
  }

  async function fetchClientGroups() {
    const { data, error } = await useApiGETBody<Record<string, T_Groups>>(
      `/opsidata/hosts/groups?selectedDepots=${selectionDepots.value}`,
    )
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      return
    } else if (data.value == undefined) {
      notifyError({
        message: $t('message.error.empty-response', {
          details: 'ClientGroupSelections',
        }),
      })
      return
    }

    fetchedData.value = groupsHelper.transformToNestedArray(data.value)
    // set expanded only for first level of clientgroups
    firstlevelkeys.value.length = 0
    for (const key in data.value) {
      firstlevelkeys.value.push(data.value[key].id)
    }
  }

  async function fetchProdGroups() {
    const { data, error } = await useApiGETBody<
      Record<string, Record<string, T_Groups>>
    >(`/opsidata/products/groups?selectedProducts=${selectionProducts.value}`)
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      return
    } else if (data.value == undefined) {
      notifyError({
        message: $t('message.error.empty-response', {
          details: 'ProductGroupSelections',
        }),
      })
      return
    }

    const groups = data.value['groups']
    fetchedData.value = groupsHelper.transformToNestedArray(groups)
  }

  const clearSelection = () => {
    isLoadingSelection.value = true
    if (props.grouptype == GroupTree_CLIENTGROUP) {
      clientGroupRef.value?.setCheckedKeys([], false)
      selectionStore.clearSelectionClients()
    } else {
      prodGroupRef.value?.setCheckedKeys([], false)
      selectionStore.clearSelectionProducts()
    }
    selectedItem.value = ''
    isLoadingSelection.value = false
  }

  function syncSelection() {
    if (props.grouptype == GroupTree_CLIENTGROUP) {
      const resNodes: any[] = groupsHelper.filterNodes(
        fetchedData.value,
        selectionClients.value,
        'text',
        undefined,
      )
      clientGroupRef.value?.setCheckedNodes(resNodes, false)
    } else {
      const resNodes: any[] = groupsHelper.filterNodes(
        fetchedData.value,
        selectionProducts.value,
        'text',
        undefined,
      )
      prodGroupRef.value?.setCheckedNodes(resNodes, false)
    }
    if (!multiSelection.value) {
      selectedItem.value =
        props.grouptype == GroupTree_CLIENTGROUP
          ? selectionClients.value[0]
          : selectionProducts.value[0]
    }
  }
  function handleClickText(node: TreeNodeData, obj: any) {
    if (node.type !== 'ObjectToGroup') {
      return
    }
    handleClickCheckbox(node, obj)
    // _getSelectionFunction()(_getSelection().value)
  }
  function handleClickCheckbox(node: TreeNodeData, obj: any) {
    if (node.type == 'ObjectToGroup') {
      // select only
      isLoadingSelection.value = true
      handleSelection(node, obj, multiSelection.value)
      isLoadingSelection.value = false
    } else if (multiSelection.value) {
      // its a group
      isLoadingSelection.value = true
      handleSelection(node, obj, multiSelection.value)
      isLoadingSelection.value = false
    }
    // setSortColumn(tabletype: string, column: string, isDesc: boolean) {
    if (props.grouptype == GroupTree_CLIENTGROUP)
      useCookie.setSortColumn('clients', 'selected', true)
    else useCookie.setSortColumn('products', 'selected', true)

    // _getSelectionFunction()(_getSelection().value)
  }
  function handleSelection(node: TreeNodeData, obj: any, multiSelect: boolean) {
    selectNode(node, obj, _getSelection(), _getSelectionFunction(), multiSelect)
  }

  function selectNode(
    node: TreeNodeData,
    obj: any,
    selection: Ref<string[]>,
    setSelectionFunction: (selection: string[]) => void,
    isMultiSelect: boolean = true,
  ) {
    if (node.type == 'ObjectToGroup') {
      if (!isMultiSelect) {
        if (!selection.value?.includes(node.text)) {
          setSelectionFunction([node.text])
        } else {
          setSelectionFunction([])
        }
      } else if (obj.checkedKeys?.includes(node.id)) {
        selection.value.push(node.text)
        setSelectionFunction([...new Set(selection.value)]) // unique values
      } else if (!selection.value?.includes(node.text)) {
        selection.value.push(node.text)
        setSelectionFunction([...new Set(selection.value)]) // unique values
      } else {
        // remove from selection and checkedKeys
        selection.value?.splice(selection.value.indexOf(node.text), 1)
        const ids = obj.checkedKeys?.filter((id: string) =>
          id.startsWith(`${node.text};`),
        )
        for (const id of ids) {
          obj.checkedKeys?.splice(obj.checkedKeys.indexOf(id), 1)
        }
      }
    } else if (isMultiSelect) {
      // its a group
      node.children?.forEach((child: TreeNodeData) => {
        selectNode(child, obj, selection, setSelectionFunction)
      })
      // setSelectionFunction(selection.value)
    }
  }
  function _getSelectionFunction() {
    return props.grouptype == GroupTree_CLIENTGROUP
      ? selectionStore.setSelectionClients
      : selectionStore.setSelectionProducts
  }
  function _getSelection() {
    return props.grouptype == GroupTree_CLIENTGROUP
      ? selectionClients
      : selectionProducts
  }
</script>
<style lang="css" scoped>
  :deep(.el-tree-node__label) {
    margin-left: 5px;
    font-size: var(--el-font-size-small);
  }
  :deep(.el-tree-node.isEmpty) {
    color: var(--color-opsi-medium-gray) !important;
  }
  :deep(.el-tree-node.isLeaf .el-tree-node__expand-icon.is-leaf) {
    display: none !important;
  }

  /* .isSingleSelect
    :deep(.el-tree-node.isGroup > .el-tree-node__content > .el-checkbox) {
    display: none !important;
  } */

  .isSingleSelect
    :deep(.el-tree-node.isLeaf > .el-tree-node__content > .el-checkbox) {
    display: none !important;
  }
</style>
