<template>
  <div data-testid="FHostParameter">
    <br />
    <el-alert v-if="!(props.type ===  'servers' || props.id)" type="warning"> Please select item</el-alert>
    <IconILoading v-else-if="isLoading" />
    <el-collapse v-else v-model="activeNames" @change="handleCollapseValueChange"
      class="mr-3 ml-3">
      <el-alert v-if="fetchedData && Object.keys(fetchedData).length === 0" type="warning"> No data found</el-alert>
      <el-collapse-item v-else
        v-for="(items, topic, index) in fetchedData" :title="(topic.toString())"
        :name="index.toString()"
      >
        <FormrowFRItems :items="items" :replace-in-id="topic + '.'" @change-item="changeItem"/>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/mixins/useComponent';
import type { T_ClientAttr, T_HostParameter, T_ServerAttr } from '~/types/APItypes';
const $t = useI18n().t
const isLoading = ref(true)
const fetchedData = ref<T_HostParameter|undefined>()
const activeNames = ref<string[]>([])
const props = defineProps({
  id: { type: String, default: undefined },
  type: { type: String, default: 'servers' },
  isChild: {type: Boolean, default: false}
})

function handleCollapseValueChange (val: any) {
  activeNames.value = val
}
function changeItem (item: any, val: any, index: number) {
  if (!item) return
  if (!val) return
  // fetchedData.value[item] = v
  item.value = val
  if (!item.possibleValues.includes(val)) {
    item.possibleValues.push(val)
  }

  // TODO: Save to backend or add to changes
}

onMounted(async ()=> {
  if (props.type ===  'servers' || props.id)
  await fetch()
})
watch(()=>props.id, async ()=>{
  if (props.type ===  'servers' || props.id)
    await fetch()
})

// async function fetch(id:string) {
//   if (props.type === 'depots' && id){
//     const {data, error} = await useApiGETBody(`/opsidata/servers?servers=[${id}]`)
//     if (error) {
//       console.error(error)
//       useNotification().error(error)
//       return
//     }
//     fetchedData.value = data.value
//   } else if (props.type === 'clients') {
//     const {data, error} = await useApiGETBody(`/opsidata/hosts?hosts=${id}`)

//     // const {data, error} = await useClient().getClientIdList(storeSel.selectionDepots)
//     if (error) {
//       console.error(error)
//       useNotification().error(error)
//       return
//     }
//     fetchedData.value = data.value
//   }
// }

async function fetch () {
  isLoading.value = true
  let endpoint: any = ''
  if (props.type === 'clients') {
    // endpoint = `/api/opsidata/config/clients?selectedClients=[${this.id}]`
    endpoint = `/opsidata/config/objects/${props.id}`
  } else if (props.type === 'servers' && props.id) {
    endpoint = `/opsidata/config/objects/${props.id}`
  } else if (props.type === 'servers') {
    endpoint = '/opsidata/config'
  } else {
    // eslint-disable-next-line no-console
    console.error('not defined')
  }
  await fetchHostParameters(endpoint)
  isLoading.value = false
}

async function fetchHostParameters (endpoint: string) {
  const {data, error} = await useApiGETBody<T_HostParameter>(endpoint)
  if (error) {
    console.error(error)
    useNotification().error(error)
    return
  }
  fetchedData.value = data.value

  // await this.$axios.$get(endpoint)
  //   .then((response) => {
  //     this.hostParam = { id: this.id, value: response }
}
</script>
