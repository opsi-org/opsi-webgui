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
import type { T_PGroups } from '~/types/APItypes'
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
const fetchedData = ref<any>({})
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
  const {data, error } = await useApiGETBody(`/opsidata/hosts/groups?selectedDepots=${storeSelection.selectionDepots}`)
  if (error) {
    useNotification().error(error)
    return
  }
    // TODO: Backend: change groups data structure
  fetchedData.value = data.value  ?
                              Object.entries(data.value).map(([label, obj] : any ) => ({ ...obj,
                                children: Object.entries(obj.children || {}).map(([labelA, objA] : any ) =>
                                ({ ...objA, children: Object.values(objA.children || {})}))}))
                              : []
}

async function fetchProdGroups() {
  const {data, error } = await useApiGETBody<T_PGroups>(`/opsidata/products/groups?selectedProducts=${storeSelection.selectionProducts}`)
  if (error) {
    useNotification().error(error)
    return
  }
  fetchedData.value = data.value.groups ?
                        Object.entries(data.value.groups).map(([label, obj] :any ) => ({ ...obj, children: Object.values(obj.children || {})}))
                        : []

  // TODO: Backend: change groups data structure
  // needed structure is [
  //   {
  //     "id":"software-on-demand",
  //     "type":"ProductGroup",
  //     "text":"software-on-demand",
  //     "parent":"root",
  //     "children": [
  //       {"id":"jedit;software-on-demand","type":"ObjectToGroup","text":"jedit","parent":"software-on-demand"},
  //       {"id":"nextcloud;software-on-demand","type":"ObjectToGroup","text":"nextcloud","parent":"software-on-demand"},
  //       {"id":"swaudit;software-on-demand","type":"ObjectToGroup","text":"swaudit","parent":"software-on-demand"}
  //     ]
  //   }
  // ]
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
  let ObjectToGroup = getNodes.filter(node=> node.type == 'ObjectToGroup').map(item => (item.text))
  let uniqueSelection = [... new Set(ObjectToGroup)]
  return uniqueSelection
}

const handleSelection = () => {
  let checkNodes = getSelection()
  if(props.grouptype == 'client-group') {
    storeSelection.setSelectionClients(checkNodes)
  }
  else {
    storeSelection.setSelectionProducts(checkNodes)
  }
}
</script>
