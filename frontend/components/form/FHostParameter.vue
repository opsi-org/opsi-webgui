<template>
  <el-collapse v-model="activeNames" @change="handleChange"
    class="mr-3 ml-3">
    <el-collapse-item v-for="(items, topic, index) in fetchedData" :title="(topic.toString())" :name="index.toString()">
      <FormrowFRItems :items="items" :replace-in-id="topic + '.'" @change-item="changeItem"/>
    </el-collapse-item>
  </el-collapse>
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/mixins/useComponent';
import { useClient } from '~/composables/mixins/useGet';
const $t = useI18n().t
const fetchedData = ref<any>({})
const activeNames = ref<string[]>([])
const props = defineProps({
  id: { type: String, default: undefined },
  type: { type: String, default: 'depots' }
})

function handleChange (val: any) {
  activeNames.value = val
}
function changeItem (item: any, val: any, index: number) {
  console.log('changeItem', item, val, index)
  // fetchedData.value[item] = v
  item.value = val
  if (!item.possibleValues.includes(val)) {
    item.possibleValues.push(val)
  }
}

onMounted(async ()=> {
  await fetch()
})
watch(()=>props.id, async ()=>{
  if (props.id)
    await fetch()
})

// async function fetch(id:string) {
//   if (props.type === 'depots' && id){
//     const {data, error} = await useApiGETBody(`/opsidata/servers?servers=[${id}]`)
//     if (error) {
//       console.log(error)
//       useNotification().error(error)
//       return
//     }
//     console.log('Fetchresult data', data.value)
//     fetchedData.value = data.value
//   } else if (props.type === 'clients') {
//     const {data, error} = await useApiGETBody(`/opsidata/hosts?hosts=${id}`)

//     // const {data, error} = await useClient().getClientIdList(storeSel.selectionDepots)
//     if (error) {
//       console.log(error)
//       useNotification().error(error)
//       return
//     }
//     fetchedData.value = data.value
//   }
// }

async function fetch () {
    let endpoint: any = ''
    if (props.type === 'clients') {
      // endpoint = `/api/opsidata/config/clients?selectedClients=[${this.id}]`
      endpoint = `/opsidata/config/objects/${props.id}`
    } else if (props.type === 'depots' && props.id) {
      endpoint = `/opsidata/config/objects/${props.id}`
    } else if (props.type === 'depots') {
      endpoint = '/opsidata/config'
    } else {
      // eslint-disable-next-line no-console
      console.error('not defined')
    }
    await fetchHostParameters(endpoint)
  }

  async function fetchHostParameters (endpoint: string) {
    const {data, error} = await useApiGETBody(endpoint)
    if (error) {
      console.log(error)
      useNotification().error(error)
      return
    }
    console.log('Fetchresult data', data.value)
    fetchedData.value = data.value

    // await this.$axios.$get(endpoint)
    //   .then((response) => {
    //     this.hostParam = { id: this.id, value: response }
  }
</script>
