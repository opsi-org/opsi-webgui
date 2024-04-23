<template>
  <div data-testid="FHostParameter">
    <br />
    <el-alert v-if="!(props.type ===  'servers' || props.id)" type="warning"> Please select item</el-alert>
    <IconILoading v-else-if="isLoading" />
    <el-collapse v-else v-model="activeNames" @change="handleCollapseValueChange"
      class="mr-3 ml-3">

      <el-alert v-if="fetchedData && Object.keys(fetchedData).length === 0" type="warning"> No data found</el-alert>
      <el-collapse-item v-else
        v-for="(items, topic, index) in fetchedData" :title="topic.toString()"
        :name="index.toString()"
      >
        <FormrowFRItems v-if="activeNames.includes(index.toString())" :items="items" :replace-in-id="topic + '.'" @change-item="changeItem"/>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/mixins/useComponent';
import { useSaveParameters } from '~/composables/mixins/useSave';
import type { T_ClientAttr, T_HostParameter, T_ServerAttr } from '~/types/APItypes'

const $t = useI18n().t
const isLoading = ref(true)
const fetchedData = ref<T_HostParameter|undefined>()
const activeNames = ref<string[]>([])
const lastSavedData = ref({ objectIds: [] as Array<string>, configIds: [] as Array<string> })
const props = defineProps({
  id: { type: String, default: undefined },
  type: { type: String, default: 'servers' },
  isChild: {type: Boolean, default: false}
})

function handleCollapseValueChange (val: any) {
  activeNames.value = val
}
function changeItem (item: any, val: any, index: number) {
  if (item == undefined) return
  if (val == undefined) return

  item.value = val
  if (!item.possibleValues.includes(val)) {
    item.possibleValues.push(val)
  }

  // TODO: Save to backend or add to changes
  handleSelection(item)
}

onMounted(async ()=> {
  if (props.type ===  'servers' || props.id)
  await fetch()
})
watch(()=>props.id, async ()=>{
  if (props.type ===  'servers' || props.id)
    await fetch()
})


// @Watch('wsBusMsg', { deep: true }) async _wsBusMsgObjectChanged2 () {
//     const msg = this.wsBusMsg
//     if (msg && this.channels.includes(msg.channel)) {
//       // console.log(`MessageBus [HostParam] received a channel msg: ${msg.channel}: ${JSON.stringify(msg.data)}`)
//       if (!(this.lastSavedData.configIds.includes(msg.data.configId) && // configId matches
//             (this.lastSavedData.objectIds.includes(msg.data.objectId) || // objectId matches
//               (this.lastSavedData.objectIds.length === 0 && msg.data.isDefault === true)
//             )
//       )) {
//         this.showToastMbus({
//           title: this.$t('message.info.event'),
//           content: this.$t('message.info.event.config_updated', { configId: msg.data.configId })
//         })
//         await this.$fetch()
//       }
//     }
//   }

// async function fetch(id:string) {
//   if (props.type === 'depots' && id){
//     const {data, error} = await useApiGETBody(`/opsidata/servers?servers=[${id}]`)
//     if (error) {
//       console.error(error)
//       useNotification($t).error(error)
//       return
//     }
//     fetchedData.value = data.value
//   } else if (props.type === 'clients') {
//     const {data, error} = await useApiGETBody(`/opsidata/hosts?hosts=${id}`)

//     // const {data, error} = await useClient($t).getClientIdList(storeSel.selectionDepots)
//     if (error) {
//       console.error(error)
//       useNotification($t).error(error)
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
  console.debug('fetched', data, error)
  if (error) {
    console.error(error)
    useNotification($t).error(error)
    return
  }
  fetchedData.value = data.value
  // await this.$axios.$get(endpoint)
  //   .then((response) => {
  //     this.hostParam = { id: this.id, value: response }
}


async function handleSelection (change: any) {
    // if (this.quicksave) {
  isLoading.value = true
  let url: string = ''
  let request: any = []
  if (props.type === 'servers' && !props.id) { // changing default configs
    url = '/opsidata/config'
    // request = [change]
    request = [
      {
        configId: change.configId,
        // value: change.value
        value: String(change.value)
      }
    ]
    lastSavedData.value.objectIds= []
    lastSavedData.value.configIds= request.map((k: any) => k.configId)

  } else if (props.type === 'clients' || props.type === 'servers') { // changing clients or depots configs
    url = '/opsidata/config/objects'
    request = {
      objectIds: [props.id],
      configs: [
        {
          configId: change.configId,
          value: String(change.value)
        }
      ]
    }
    lastSavedData.value.objectIds = request.objectIds || []
    lastSavedData.value.configIds = request.configs?.map((k: any) => k.configId)
  } else {
    console.error('not defined')
  }
  console.log('handleSelection', url, request)
  await useSaveParameters($t).saveParameters(url, request, null, true)
  isLoading.value = false
    // } else {
    //   this.trackHostParameters(change)
    // }
  }
</script>
