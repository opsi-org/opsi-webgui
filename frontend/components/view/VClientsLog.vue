<template>
  <div v-loading="loading">
    <el-form :inline="true" label-position="top" class="mt-2">
      <el-form-item :label="$t('form.clientId')" v-if="props.isChild === false"> <SelectSHosts :type="type" @change="setId" :id="logrequest.selectedClient" /> </el-form-item>
      <el-form-item :label="$t('form.logtype')">
        <el-select v-model="logtype" style="min-width: 200px"> <el-option v-for="type in logTypes" :key="type" :label="type" :value="type" /> </el-select>
      </el-form-item>
      <el-form-item :label="$t('form.loglevel')"> <el-slider v-model="loglevel" show-stops :max="8" style="min-width: 200px" /> </el-form-item>
    </el-form>
    {{ fetchedData }}
  </div>


  <!--
        <b-form-input
          v-if="logResult.length > 1"
          id="filter"
          v-model.trim="filterQuery"
          size="sm"
          class="ml-1 filter_logs"
          :aria-label="$t('form.filter.logs')"
          :placeholder="$t('form.filter.logs')"
          @keyup="filterLog"
        />
    <DivDScrollResult v-if="logResult">
      <div v-if="filteredLog.includes('')">
        {{ t_fixed('keep-english.empty') }}
      </div>
      <div
        v-for="(log, index) in filteredLog"
        :key="index"
        :class="{ 'd-none': !isLoglevelSmaller(log, loglevel) }"
      >
        <span
          v-if="log != ''"
          class="log-row-text"
          :class="{
            'log-row-1': log.startsWith('[1]'),
            'log-row-2': log.startsWith('[2]'),
            'log-row-3': log.startsWith('[3]'),
            'log-row-4': log.startsWith('[4]'),
            'log-row-5': log.startsWith('[5]'),
            'log-row-6': log.startsWith('[6]'),
            'log-row-7': log.startsWith('[7]'),
            'log-row-8': log.startsWith('[8]'),
            'log-row-9': log.startsWith('[9]'),
          }"
        >
          {{ t_fixed('keep-english.(content)').replace('content', index) }} {{ log }}
        </span>
         -->
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
  loading.value = false
}

function setId(id:string) {
  logrequest.selectedClient = id
}

//   logResult: Array<string> = []
//   filteredLog: Array<string> = []
//   filterQuery: string = ''
//   logrequest: LogRequest = { selectedClient: '', selectedLogType: '' }
//   errorText: string = ''

//   @selections.Getter public XselectionLogClient!: string
//   @selections.Getter public XselectionLogType!: string
//   @selections.Getter public XselectionLogLevel!: number
//   @selections.Mutation public XsetSelectionLogClient!: (s: string) => void
//   @selections.Mutation public XsetSelectionLogType!: (s: string) => void
//   @selections.Mutation public XsetSelectionLogLevel!: (s: number) => void

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
//   @Watch('loglevel', { deep: true }) loglevelChanged () {
//     this.XsetSelectionLogLevel(this.loglevel)
//   }

//   @Watch('logtype', { deep: true }) async logtypeChanged () {
//     this.XsetSelectionLogType(this.logtype)
//     if (this.XselectionLogType && this.id) { await this._fetch() }
//   }

//   @Watch('id', { deep: true }) async idChanged () {
//     // this.setSelectionLogClient(this.id)
//     if (this.XselectionLogType && this.id) { await this._fetch() }
//   }

//   async beforeMount () {
//     // eslint-disable-next-line brace-style
//     if (this.id) { this.XsetSelectionLogClient(this.id) }
//     else if (this.XselectionLogClient) { this.id = this.XselectionLogClient }

//     this.loglevel = this.XselectionLogLevel
//     this.logtype = this.XselectionLogType
//     if (this.XselectionLogType && this.id) { await this._fetch() }
//     if (this.testdata) { this.logResult = this.testdata }
//   }

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

//   async getLog (id: string, logtype: string) {
//     this.isLoading = true
//     this.logrequest.selectedClient = id
//     this.logrequest.selectedLogType = logtype
//     const params = this.logrequest
//     await this.$axios.$get('/api/opsidata/log', { params })
//       .then((response) => {
//         this.logResult = response.result
//         this.filteredLog = this.logResult
//       }).catch((error) => {
//         this.showToastError(error)
//       })
//     this.isLoading = false
//   }
</script>

