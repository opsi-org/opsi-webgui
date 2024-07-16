<template>
  <div data-testid="FHostAttributes">
    <el-alert v-if="!props.id" type="warning"> Please select item</el-alert>
    <el-alert v-else-if="!hostAttributes" type="warning"> Data is not available</el-alert>
    <el-form v-else label-width="200px" class="w-full">
      <div v-for="(value, label) in hostAttributes[0]" :key="label">
        <el-form-item :label="$t('table.fields.' + label)">
          <el-input v-model="hostAttributes[label.toString()]" />
        </el-form-item>
      </div>
      <el-form-item>
        <el-button @click="resetForm()"> {{ $t('button.reset') }}</el-button>
        <el-button type="success" @click="saveHostAttributes">{{ $t('button.save') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/mixins/useComponent';
import { useSetUEFI } from '~/composables/mixins/usePost';
import type {T_ServerAttr, T_ClientAttr} from '~/types/APItypes'
const $t = useI18n().t
const { notifyError } = useNotification()
const hostAttributes = ref<Array<T_ServerAttr|T_ClientAttr>>([])
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
      if (error) {
      notifyError({ message: error?.response?.data?.message || $t('message.error.generic') })
      return
    }
    if (data.value == undefined) {
      notifyError({ message: $t('message.error.empty-response', { details: "HostAttributes" }) })
      return
    }
    hostAttributes.value = data.value
  } catch (error) {
    notifyError({ message: $t('message.error.unexpected') })
  }
}

async function resetForm () {
  if (props.id)
    await fetchData(props.id)
}

async function saveHostAttributes() {
  console.log('saveHostAttributes')
  const hostAttr = hostAttributes.value
  delete hostAttr.type
  delete hostAttr.created
  delete hostAttr.lastSeen
  delete hostAttr.systemUUID
  if (props.type === 'clients') {
    useSetUEFI.setUEFI(hostAttr.hostId, hostAttr.uefi.toString())
    delete hostAttr.uefi
  }
  const endPoint = props.type === 'clients' ? `/api/opsidata/clients/${hostAttr.hostId}` : `/api/opsidata/servers/${hostAttr.hostId}`
  const {error} = await useApiPUT(endPoint, hostAttr)
  if (error) {
    notifyError({ message: error?.response?.data?.message || $t('message.error.generic') })
    return
  }
  notifySuccess({ message: $t('message.success.save.hostattributes', { host: hostAttr.hostId }) })
  await fetchData(props.id)
}
</script>
