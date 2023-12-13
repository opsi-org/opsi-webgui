<template>
  <div>
    <el-form label-width="200px">
      <div v-for="(value, label, index) in fetchedData[0]" :key="index">
        <el-form-item :label="label.toString()">
          <el-input :value="value" />
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/mixins/useComponent';
import { useClient } from '~/composables/mixins/useGet';
const $t = useI18n().t
let fetchedData = ref<Array<any>>([])
const props = defineProps({
  id: { type: String, default: undefined },
  type: { type: String, default: 'depots' }
})

onMounted(async ()=> {
  if (props.id)
    await fetch(props.id)
})
watch(()=>props.id, ()=>{
  if (props.id)
    fetch(props.id)
})

async function fetch(id:string) {
  if (props.type === 'depots'){
    const {data, error} = await useApiGETBody(`/opsidata/servers?servers=[${id}]`)
    if (error) {
      console.log(error)
      useNotification().error(error)
      return
    }
    console.log('Fetchresult data', data.value)
    fetchedData.value = data.value
  } else if (props.type === 'clients') {
    const {data, error} = await useApiGETBody(`/opsidata/hosts?hosts=${id}`)

    // const {data, error} = await useClient().getClientIdList(storeSel.selectionDepots)
    if (error) {
      console.log(error)
      useNotification().error(error)
      return
    }
    fetchedData.value = data.value
  }
}
</script>
