<template>
  <IconILoading v-if="isLoading" />
  <el-button @click="setCheckedKeys">set by key</el-button>
  <el-button @click="resetChecked();storeSelection.clearSelectionProducts"> {{$t('table.selection.clear')}}</el-button>
  <el-tree
    ref="prodGroupRef"
    :data="fetchedData"
    :props="defaultProps"
    show-checkbox
    node-key="text"
    default-expand-all
    highlight-current
    @check-change="handleCheckChange" />
  <!-- <TreeTSDefaultGroups
    :show-as-multi="multi"
    :store="{selection:selectionProducts, pushSelection:pushToSelectionProducts, delSelection: delFromSelectionProducts}"
    @change="changeSelection"
  />  -->
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElTree } from 'element-plus'
import { useNotification } from '~/composables/mixins/useComponent';
const isLoading = ref(false)
interface Tree {
  name: string
}
const prodGroupRef = ref<InstanceType<typeof ElTree>>()
const defaultProps = {
  label: 'text',
  children: 'children'
}
const fetchedData = ref<any>({})
const storeSelection = storeSelections()
onMounted(async ()=> {
  await fetch()
})
async function fetch() {
  isLoading.value = true
  const {data, error } = await useApiGETBody(`/opsidata/products/groups?selectedProducts=${storeSelection.selectionProducts}`)
  if (error) {
    console.log(error)
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
const setCheckedKeys = () => {
  prodGroupRef.value!.setCheckedKeys(['jedit'], true)
}

const resetChecked = () => {
  prodGroupRef.value!.setCheckedKeys([], false)
}

const handleCheckChange = (
  data: Tree,
  checked: boolean
) => {
  console.log('Data',JSON.stringify(data)),
  console.log('checked',JSON.stringify(checked))
}

//   changeSelection (selection: Event) {
//     if (selection === undefined) { return }
//     if (!Array.isArray(selection)) { return }

//     if (selection.length > 0) {
//       this.setSelectionProducts([...selection])
//     } else {
//       this.setSelectionProducts([])
//     }
//   }
// }
</script>
