<template>
  <div data-testid="FHostAttributes">
    <el-alert v-if="!props.id" type="warning"> Please select item</el-alert>
    <el-alert v-else-if="Object.keys(fetchedData).length === 0" type="warning"> No data found</el-alert>
    <el-form v-else label-width="200px" class="w-full">
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
import type {T_ServerAttr, T_ClientAttr} from '~/types/APItypes'
const $t = useI18n().t
let fetchedData = ref<Array<T_ServerAttr|T_ClientAttr>>([])
const props = defineProps({
  id: { type: String, default: undefined },
  type: { type: String, default: 'servers' },
  isChild: {type: Boolean, default: false }
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
  if (props.type === 'servers' && id){
    const {data, error} = await useApiGETBody<Array<T_ServerAttr>>(`/opsidata/servers?servers=[${id}]`)
    if (error) {
      console.error(error)
      useNotification($t).error(error)
      return
    } else if (data.value == undefined) {
      useNotification($t).error($t('message.error.empty-response'))
      return
    }
    fetchedData.value = data.value
  } else if (props.type === 'clients') {
    const {data, error} = await useApiGETBody<Array<T_ClientAttr>>(`/opsidata/hosts?hosts=${id}`)
    // const {data, error} = await useClient($t).getClientIdList(storeSel.selectionDepots)
    if (error) {
      console.error(error)
      useNotification($t).error(error)
      return
    } else if (data.value == undefined) {
      useNotification($t).error($t('message.error.empty-response'))
      return
    }
    fetchedData.value = data.value
  }
}
</script>
