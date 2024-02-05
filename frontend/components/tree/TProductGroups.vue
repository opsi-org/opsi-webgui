<template>
  <IconILoading v-if="isLoading" />
  <el-button @click="clearSelection"> {{$t('table.selection.clear')}}</el-button>
  <el-tree
    ref="prodGroupRef"
    :data="fetchedData"
    :props="defaultProps"
    show-checkbox
    node-key="text"
    default-expand-all
    highlight-current
    @check-change="handleProductSelection" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElTree } from 'element-plus'
import { useNotification } from '~/composables/mixins/useComponent';
import type { T_PGroups } from '~/types/APItypes'
const isLoading = ref(false)
const prodGroupRef = ref<InstanceType<typeof ElTree>>()
const defaultProps = {
  label: 'text',
  children: 'children'
}
const fetchedData = ref<any>({})
const storeSelection = storeSelections()

watch(()=>storeSelection.selectionProducts, async ()=>{
  syncSelection()
})

onMounted(async ()=> {
  await fetch()
  syncSelection()
})

async function fetch() {
  isLoading.value = true
  const {data, error } = await useApiGETBody<T_PGroups>(`/opsidata/products/groups?selectedProducts=${storeSelection.selectionProducts}`)
  if (error) {
    useNotification().error(error)
    isLoading.value = false
    return
  }
  fetchedData.value = data.value.groups ?
                        Object.entries(data.value.groups).map(([label, obj] :any ) => ({ ...obj, children: Object.values(obj.children || {})}))
                        : []
  isLoading.value = false

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

const syncSelection = () => {
  prodGroupRef.value!.setCheckedKeys(storeSelection.selectionProducts, false)
}

const clearSelection = () => {
  prodGroupRef.value!.setCheckedKeys([], false)
  storeSelection.clearSelectionProducts()
}

const handleProductSelection = () => {
  const getNodes = prodGroupRef.value!.getCheckedNodes(false, false)
  const checkNodes = getNodes.filter(node=> node.type == 'ObjectToGroup').map(item => (item.text))
  storeSelection.setSelectionProducts(checkNodes)
}
</script>
