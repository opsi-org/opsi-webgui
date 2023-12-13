<template>
  <div>
    <SelectSServers :id="props.id" @change="fetch"/>
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
const $t = useI18n().t
let fetchedData = ref<Array<any>>([])
const props = defineProps({
  id: { type: String, default: undefined }
})

onMounted(async ()=> {
  if (props.id)
    await fetch(props.id)
})

async function fetch(id:string) {
  const {data, error} = await useApiGETBody(`/opsidata/servers?servers=[${id}]`)
  if (error) {
    console.log(error)
    useNotification().error(error)
    return
  }
  console.log('Fetchresult data', data.value)
  fetchedData.value = data.value
}
</script>
