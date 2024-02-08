<template>
  <div v-loading="loading">
    <el-form :inline="true" label-position="top" class="mt-2">
      <el-form-item :label="$t('form.clientId')" v-if="props.isChild === false"> <SelectSHosts :type="type" @change="setId" :id="logrequest.selectedClient" /> </el-form-item>
      <el-form-item :label="$t('form.logtype')">
        <el-select v-model="logtype" style="min-width: 200px"> <el-option v-for="type in logTypes" :key="type" :label="type" :value="type" /> </el-select>
      </el-form-item>
      <el-form-item :label="$t('form.loglevel')"> <el-slider v-model="loglevel" show-stops :max="8" style="min-width: 200px" /> </el-form-item>
    </el-form>
    <el-input v-if="fetchedData.length > 1" v-model="filterQuery" :placeholder="$t('form.filter.logs')"  @input="filterLog" />
    <span
      v-for="(log, index) in fetchedData"
      :key="index"
      :style="{ color: getColorBasedOnLoglevel(log) }"
    >
     {{ index }} - {{ log }} <br>
    </span>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/mixins/useComponent';
import type { T_ClientLog } from '~/types/APItypes';

const props = defineProps({
  id: { type: String, default: '' },
  type: { type: String, default: 'servers' },
  isChild: { type: Boolean, default: false }
})

let fetchedData = ref<Array<string>>([])
const loading = ref(false)
let logrequest = { selectedClient: '', selectedLogType: '' }
const logTypes = ['bootimage', 'clientconnect', 'instlog', 'opsiconfd', 'userlogin']
const loglevel = 5
const logtype = ref('instlog')
const filterQuery = ref('')

onMounted(async ()=> {
  if (props.id!= ''){ await fetch() }
})

watch(()=>logrequest.selectedClient, ()=>{
  fetch()
})

watch(()=>logtype.value, ()=>{
  fetch()
})

async function fetch() {
  loading.value = true
  logrequest.selectedClient = props.id
  if(logtype.value!=''){
    logrequest.selectedLogType = logtype.value
  } else { logrequest.selectedLogType = 'instlog' }
  const {data, error} = await useApiGETBody<T_ClientLog>('/opsidata/log', logrequest )
  if (error) {
    console.log(error)
    useNotification().error(error)
    loading.value = false
    return
  }
  fetchedData.value = data.value.result
  fetchedData.value = ['null',
        '[0] [2023-03-31 12:29:49.371] opsiclientd service start (service.py:132)',
        '[1] [2023-03-31 12:29:49.371] opsiclientd service start (service.py:132)',
        '[2] [2023-03-31 12:29:49.371] opsiclientd service start (service.py:132)',
        '[3] [2023-03-31 12:29:49.371] opsiclientd service start (service.py:132)',
        '[4] [2023-03-31 12:29:49.371] opsiclientd service start (service.py:132)',
        '[5] [2023-03-31 12:29:49.371] opsiclientd service start (service.py:132)',
        '[6] [2023-03-31 12:29:49.371] opsiclientd service start (service.py:132)',
        '[7] [2023-03-31 12:29:49.371] opsiclientd service start (service.py:132)',
        '[8] [2023-03-31 12:29:49.371] opsiclientd service start (service.py:132)',
        '[0] [2023-03-31 12:29:49.371] opsiclientd service start (service.py:132)'
      ]
  loading.value = false
}

function filterLog() {
  return fetchedData.value.filter(log => log.includes(filterQuery.value))
}

function setId(id:string) {
  logrequest.selectedClient = id
}

function getColorBasedOnLoglevel(log:string) {
  const logLevel = parseInt(log.charAt(1), 10);
  let color;
  switch (logLevel) {
      case 1:
          color = 'var(--opsi-log-essential)';
          break;
      case 2:
          color = 'var(--opsi-log-critical)';
          break;
      case 3:
          color = 'var(--opsi-log-error)';
          break;
      case 4:
          color = 'var(--opsi-log-warning)';
          break;
      case 5:
          color = 'var(--opsi-log-notice)';
          break;
      case 6:
          color = 'var(--opsi-log-info)';
          break;
      case 7:
          color = 'var(--opsi-log-debug)';
          break;
      case 8:
          color = 'var(--opsi-log-trace)';
          break;
      case 9:
          color = 'var(--opsi-log-secret)';
          break;
      default:
          color = 'var(--color)';
  }
  return color;
}


//   wsBusMsg: any // mixin // store
//   wsSubscribeChannel: any
//   channels = ['event:log_updated']

//   @Watch('wsBusMsg', { deep: true }) _wsBusMsgObjectChanged2 () {
//     const msg = this.wsBusMsg
//     // console.log('MessageBus: receive-watch: ', msg)
//     if (msg && this.channels.includes(msg.channel) && msg.data.type === this.logtype && msg.data.object_id === this.id) {
//       this.showToastMbus({
//         title: this.$t('message.info.event'),
//         content: this.$t('message.info.event.log_updated'),
//         reloadAction: this._fetch // shows (default) reload button
//       })
//     } else {
//       console.log('MessageBus other: ', msg.channel, msg.data)
//     }
//   }

//   @Watch('filterQuery', { deep: true }) filterQueryChanged () { this.filterLog() }


//   filterLog () {
//     if (this.filterQuery) {
//       this.filteredLog = this.logResult.filter(log =>
//         log.toLowerCase().includes(this.filterQuery.toLowerCase())
//       )
//     } else {
//       this.filteredLog = this.logResult
//     }
//   }

//   isLoglevelSmaller (logrow:string, loglevel:number) {
//     // match charakters in beginning with [<=loglevel] or not [0-9]
//     const rxSelf2 = new RegExp('^((\\[[0-' + loglevel + ']\\])|[^\\[0-9\\]])', 'g')
//     const result = RegExp(rxSelf2).exec(logrow)
//     return !!result
//   }


</script>

