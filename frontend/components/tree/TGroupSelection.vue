<template>
  <el-button @click="clearSelection" size="small">
    {{ $t('table.selection.clear') }}
  </el-button>
  <el-tree
    :ref="props.grouptype == 'client-group' ? 'clientGroupRef' : 'prodGroupRef'"
    v-loading="isLoading"
    :data="fetchedData"
    :props="defaultProps"
    show-checkbox
    node-key="id"
    default-expand-all
    highlight-current
    @check="handleSelectOneNode"
  />
</template>

<script setup lang="ts">
  import { ElTree } from 'element-plus'
  import { useNotification } from '~/composables/mixins/useComponent'
  import { useGroupsHelper } from '~/composables/mixins/useGroupsHelper'
  import type { T_Groups } from '~/types/APItypes'
  import type { TreeNodeData } from 'element-plus/lib/components/tree/src/tree.type.js'

  const { notifyError } = useNotification()
  const $t = useI18n().t
  const groupsHelper = useGroupsHelper()
  const props = defineProps({
    grouptype: { type: String, required: true },
  })
  const isLoading = ref(false)
  const clientGroupRef = ref<InstanceType<typeof ElTree>>()
  const prodGroupRef = ref<InstanceType<typeof ElTree>>()
  const defaultProps = {
    label: 'text',
    children: 'children',
  }
  const fetchedData = ref<any>([])
  const storeSelection = storeSelections()

  const { selectionDepots, selectionClients, selectionProducts } =
    storeToRefs(storeSelection)

  onMounted(async () => {
    isLoading.value = true
    if (props.grouptype == 'client-group') {
      await fetchClientGroups()
    } else {
      await fetchProdGroups()
    }
    syncSelection()
    isLoading.value = false
  })

  watch(() => selectionClients.value, syncSelection, { deep: true })
  watch(() => selectionProducts.value, syncSelection, { deep: true })

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
    if (props.grouptype == 'client-group') {
      clientGroupRef.value?.setCheckedKeys([], false)
      storeSelection.clearSelectionClients()
    } else {
      prodGroupRef.value?.setCheckedKeys([], false)
      storeSelection.clearSelectionProducts()
    }
  }

  function syncSelection() {
    if (props.grouptype == 'client-group') {
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
  }

  function handleSelectOneNode(node: TreeNodeData, obj: any) {
    if (props.grouptype == 'client-group') {
      selectNode(
        node,
        obj,
        selectionClients,
        storeSelection.setSelectionClients,
      )
    } else {
      selectNode(
        node,
        obj,

        selectionProducts,
        storeSelection.setSelectionProducts,
      )
    }
  }

  function selectNode(
    node: TreeNodeData,
    obj: any,
    selection: Ref<string[]>,
    setSelectionFunction: (selection: string[]) => void,
  ) {
    if (node.type == 'ObjectToGroup') {
      if (obj.checkedKeys.includes(node.id)) {
        selection.value.push(node.text)
      } else {
        setSelectionFunction(
          selection.value.filter((item: string) => item != node.text),
        )
      }
    } else {
      // its a group
      node.children?.forEach((child: TreeNodeData) => {
        selectNode(child, obj, selection, setSelectionFunction)
      })
    }
  }
</script>
<style lang="css" scoped>
  :deep(.el-tree-node__label) {
    margin-left: 5px;
    font-size: var(--el-font-size-small);
  }
</style>
