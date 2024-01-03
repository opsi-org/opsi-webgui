<template>
  <el-select v-model="value" clearable :placeholder="$t('select.placeholder.'+type)">
    <el-option
      v-for="item in fetchedData"
      :key="item"
      :label="item"
      :value="item"
    />
  </el-select>
</template>

<script setup lang="tsx">
import { useNotification } from '~/composables/mixins/useComponent';
import { useClient, useDepot } from '~/composables/mixins/useGet';
const $t = useI18n().t
const storeSel = storeSelections()
const fetchedData = ref<Array<any>>([])
const value = ref<string|undefined>()
const props = defineProps({
  id: { type: String, default: undefined },
  type: { type: String, default: 'depots' }
})
const emit = defineEmits(['update:value'])
onMounted(async ()=> {
  await fetch()
  // if (props.id)
  value.value = props.id
})
watch(()=>value.value, ()=>{
  // emit('change', value.value)
  emit('update:value', value.value)
})
async function fetch() {
  if (props.type === 'depots'){
    const {data, error} = await useDepot().getDepotIdList()
    if (error) {
      console.log(error)
      useNotification().error(error)
      return
    }
    fetchedData.value = data.value
  } else if (props.type === 'clients') {
    const {data, error} = await useClient().getClientIdList(storeSel.selectionDepots)
    if (error) {
      console.log(error)
      useNotification().error(error)
      return
    }
    fetchedData.value = data.value
  }
}
</script>
