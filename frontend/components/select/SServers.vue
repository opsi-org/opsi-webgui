<template>
  <el-select v-model="value" clearable placeholder="Select a Server">
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
import { useDepot } from '~/composables/mixins/useGet';
const $t = useI18n().t
let fetchedData = ref<Array<any>>([])
const value = ref('')
const props = defineProps({
  id: { type: String, default: undefined }
})
const emit = defineEmits(['update:value'])
onMounted(async ()=> {
  await fetch()
  if (props.id)
  value.value = props.id
})
watch(()=>value.value, ()=>{
  // emit('change', value.value)
  emit('update:value', value.value)
})
async function fetch() {
  const {data, error} = await useDepot().getDepotIdList()
  fetchedData = data
}
</script>
