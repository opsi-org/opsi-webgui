<template>
  <IconILoading v-if="isLoading" />
  <el-button @click="syncSelection" size="small"> {{ $t('button.syncSelect') }} </el-button>
  <el-button @click="clearSelection" size="small"> {{$t('table.selection.clear')}} </el-button>
  <el-tree
    :ref="props.grouptype == 'client-group'? 'clientGroupRef': 'prodGroupRef'"
    :data="fetchedData"
    :props="defaultProps"
    show-checkbox
    node-key="text"
    default-expand-all
    highlight-current
    @check-change="handleSelection" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElTree } from 'element-plus'
import { useNotification } from '~/composables/mixins/useComponent';
import { useGroupsHelper } from '~/composables/mixins/useGroupsHelper';
import type { T_Groups } from '~/types/APItypes'

const { notifyError } = useNotification()
const $t = useI18n().t
const groupsHelper = useGroupsHelper()
const props = defineProps({
  grouptype: {type: String, required: true}
})
const isLoading = ref(false)
const clientGroupRef = ref<InstanceType<typeof ElTree>>()
const prodGroupRef = ref<InstanceType<typeof ElTree>>()
const defaultProps = {
  label: 'text',
  children: 'children'
}
const fetchedData = ref<any>([])
const storeSelection = storeSelections()

onMounted(async ()=> {
  isLoading.value = true
  if(props.grouptype == 'client-group') {
    await fetchClientGroups()
  }
  else {
    await fetchProdGroups()
  }
  isLoading.value = false
})

async function fetchClientGroups() {
  const {data, error } = await useApiGETBody<Record<string, T_Groups>>(`/opsidata/hosts/groups?selectedDepots=${storeSelection.selectionDepots}`)
  if (error) {
    notifyError({ message: error?.response?.data?.message })
    return
  } else if (data.value == undefined) {
    notifyError({ message: $t('message.error.empty-response', { details: "ClientGroupSelections" }) })
    return
  }

  fetchedData.value = groupsHelper.transformToNestedArray(data.value);
}

async function fetchProdGroups() {
  const {data, error } = await useApiGETBody<Record<string, Record<string, T_Groups>>>(`/opsidata/products/groups?selectedProducts=${storeSelection.selectionProducts}`)
  if (error) {
    notifyError({ message: error?.response?.data?.message })
    return
  } else if (data.value == undefined) {
    notifyError({ message: $t('message.error.empty-response', { details: "ProductGroupSelections" }) })
    return
  }

  const groups = data.value['groups']
  fetchedData.value = groupsHelper.transformToNestedArray(groups);
}

const clearSelection = () => {
  if(props.grouptype == 'client-group') {
    clientGroupRef.value!.setCheckedKeys([], false)
    storeSelection.clearSelectionClients()
  } else {
    prodGroupRef.value!.setCheckedKeys([], false)
    storeSelection.clearSelectionProducts()
  }
}

// NOTE: Sync feature
// Synchronize from tree to table: Always
// Synchronize from table to tree: Only on button click.
// Since tree elements are a subset of table elements,
// And if there is no table element in the tree structure, the selection will be deselected during synchronization.

const syncSelection = () => {
  if(props.grouptype == 'client-group') {
    clientGroupRef.value!.setCheckedKeys(storeSelection.selectionClients, false)
  } else {
    prodGroupRef.value!.setCheckedKeys(storeSelection.selectionProducts, false)
  }
}

const getSelection = () => {
  let getNodes = []
  if(props.grouptype == 'client-group') {
    getNodes = clientGroupRef.value!.getCheckedNodes(false, false)
  }
  else {
    getNodes = prodGroupRef.value!.getCheckedNodes(false, false)
  }
  const ObjectToGroup = getNodes.filter(node=> node.type == 'ObjectToGroup').map(item => (item.text))
  const uniqueSelection = [... new Set(ObjectToGroup)]
  return uniqueSelection
}

const handleSelection = () => {
  const checkedNodes = getSelection()
  if(props.grouptype == 'client-group') {
    storeSelection.setSelectionClients(checkedNodes)
  }
  else {
    storeSelection.setSelectionProducts(checkedNodes)
  }
}
</script>
