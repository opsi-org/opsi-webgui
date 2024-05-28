<template>
  <div data-testid="FHostAttributes">
    <el-alert v-if="!props.id" type="warning"> Please select item</el-alert>
    <el-alert v-else-if="!fetchedData" type="warning"> Data is not available</el-alert>
    <el-form v-else label-width="200px" class="w-full">
      <div v-for="(value, label) in fetchedData[0]" :key="label">
        <el-form-item :label="$t('table.fields.' + label)">
          <el-input :value="value" disabled />
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/mixins/useComponent';
import type {T_ServerAttr, T_ClientAttr} from '~/types/APItypes'
const $t = useI18n().t
const { notifyError } = useNotification()
const fetchedData = ref<Array<T_ServerAttr|T_ClientAttr>>([])
const props = defineProps({
  id: { type: String, default: undefined },
  type: { type: String, default: 'servers' },
  isChild: {type: Boolean, default: false }
})

onMounted(async ()=> {
  if (props.id)
    await fetchData(props.id)
})
watch(()=>props.id, ()=>{
  if (props.id)
    fetchData(props.id)
})

async function fetchData(id:string) {
  try {
    const url = props.type === 'servers' ? `/opsidata/servers?servers=[${id}]` : `/opsidata/hosts?hosts=${id}`
    const {data, error} = await useApiGETBody<Array<T_ServerAttr|T_ClientAttr>>(url)
    if (error) throw error
    if (data.value == undefined) throw new Error($t('message.error.empty-response'))
    fetchedData.value = data.value
  } catch (error) {
    notifyError({ message: error })
  }
}
</script>
