<template>
  <el-form :inline="true" label-position="top" class="mt-2">
    <el-form-item :label="$t('form.clientId')" v-if="props.isChild === false">
      <SelectSHosts :type="type" @change="setId" :id="logrequest.selectedClient" />
    </el-form-item>
    <el-form-item :label="$t('form.logtype')">
      <el-select v-model="logtype" style="min-width: 200px">
        <el-option v-for="logtype in logTypes" :key="logtype" :label="logtype" :value="logtype" />
      </el-select>
    </el-form-item>
    <template v-if="fetchedData.length > 1">
      <el-form-item :label="$t('form.filter.logs')">
        <el-input v-model="filterQuery" @input="filterLogByQuery" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item :label="$t('form.loglevel')">
        <el-slider v-model="loglevel" show-stops :max="8" style="min-width: 200px" />
      </el-form-item>
    </template>
  </el-form>
  <el-scrollbar height="79vh" v-if="fetchedData.length > 1" v-loading="isLoading">
    <span
      v-for="(log, index) in filteredData"
      :key="index"
      :style="{ color: getColorBasedOnLoglevel(log) }"
      :class="{ 'd-none': !isLoglevelSmaller(log, loglevel) }"
    >
    {{ index }} - {{ log }} <br>
    </span>
  </el-scrollbar>
</template>
<script setup lang="ts">
import { useNotification } from '~/composables/mixins/useComponent';
import type { T_ClientLog } from '~/types/APItypes';

// TODO: messagebus event:log_updated

const props = defineProps({
  id: { type: String, default: '' },
  type: { type: String, default: 'servers' },
  isChild: { type: Boolean, default: false }
})

let fetchedData = ref<Array<string>>([])
let filteredData = ref<Array<string>>([])
const isLoading = ref(false)
let logrequest = { selectedClient: '', selectedLogType: '' }
const logTypes = ['bootimage', 'clientconnect', 'instlog', 'opsiconfd', 'userlogin']
const loglevel = ref(5)
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
  isLoading.value = true
  logrequest.selectedClient = props.id
  if(logtype.value!=''){
    logrequest.selectedLogType = logtype.value
  } else { logrequest.selectedLogType = 'instlog' }
  const {data, error} = await useApiGETBody<T_ClientLog>('/opsidata/log', logrequest )
  if (error) {
    console.log(error)
    useNotification().error(error)
    isLoading.value = false
    return
  }
  fetchedData.value = data.value.result
  filteredData.value = fetchedData.value
  isLoading.value = false
}

function filterLogByQuery() {
  filteredData.value = fetchedData.value.filter(log => log.includes(filterQuery.value))
}

function isLoglevelSmaller (logrow:string, loglevel:number) {
  // match charakters in beginning with [<=loglevel] or not [0-9]
  const rxSelf2 = new RegExp('^((\\[[0-' + loglevel + ']\\])|[^\\[0-9\\]])', 'g')
  const result = RegExp(rxSelf2).exec(logrow)
  return !!result
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
</script>