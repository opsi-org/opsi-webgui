<template>
  <el-form :inline="true" label-position="top" class="mt-2" v-loading="isLoading">
    <el-form-item :label="$t('form.clientId')" v-if="!props.isChild">
      <SelectSHosts :type="type" @change="setId" :id="logrequest.selectedClient" />
    </el-form-item>
    <el-form-item :label="$t('form.logtype')">
      <el-select v-model="logtype" style="min-width: 200px">
        <el-option v-for="logtype in logTypes" :key="logtype" :label="logtype" :value="logtype" />
      </el-select>
    </el-form-item>
    <template v-if="fetchedData.length > 1">
      <el-form-item :label="$t('form.filter.logs')">
        <el-input v-model="filterQuery" clearable style="width: 200px" @input="filterLogByQuery" />
      </el-form-item>
      <el-form-item :label="$t('form.loglevel')">
        <el-slider v-model="loglevel" show-stops :max="8" style="min-width: 200px" />
      </el-form-item>
    </template>
  </el-form>
  <el-scrollbar height="79vh" v-if="fetchedData.length > 1">
    <span
      v-for="log in filteredData"
      :key="log"
      :style="{ color: getColorBasedOnLoglevel(log) }"
      :class="{ 'd-none': !isLoglevelSmaller(log, loglevel) }"
    >
    {{ log }} <br>
    </span>
  </el-scrollbar>
  <el-alert v-else :title="$t('message.info.nologs')" type="info" show-icon :closable="false" />
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/mixins/useComponent';
import type { T_ClientLog } from '~/types/APItypes';
const { notifyError } = useNotification()
const $t = useI18n().t

const props = defineProps({
  id: { type: String, default: '' },
  type: { type: String, default: 'clients' },
  isChild: { type: Boolean, default: false }
})

const fetchedData = ref<Array<string>>([])
const filteredData = ref<Array<string>>([])
const isLoading = ref(false)
const logrequest = { selectedClient: props.id, selectedLogType: 'instlog' }
const logTypes = ['bootimage', 'clientconnect', 'instlog', 'opsiconfd', 'userlogin']
const loglevel = ref(5)
const logtype = ref('instlog')
const filterQuery = ref('')
// TODO: messagebus event:log_updated
watch([()=>props.id, ()=>logtype.value], fetch, { immediate: true })

async function fetch() {
  isLoading.value = true
  logrequest.selectedLogType = logtype.value
  try {
    const {data, error} = await useApiGETBody<T_ClientLog>('/opsidata/log', logrequest)
      if (error) {
      notifyError({ message: error?.response?.data?.message || $t('message.error.generic') })
      return
    }
    if (data.value == undefined) {
      notifyError({ message: $t('message.error.empty-response', { details: "ClientsLog" }) })
      return
    }
    fetchedData.value = data.value.result
    filteredData.value = fetchedData.value
  } catch (error) {
    notifyError({ message: error || $t('message.error.unexpected') })
  } finally {
    isLoading.value = false
  }
}

function filterLogByQuery() {
  filteredData.value = fetchedData.value.filter(log => log.includes(filterQuery.value))
}

function isLoglevelSmaller (logrow:string, loglevel:number) {
  const rxSelf2 = new RegExp('^((\\[[0-' + loglevel + ']\\])|[^\\[0-9\\]])', 'g')
  const result = RegExp(rxSelf2).exec(logrow)
  return !!result
}

function getColorBasedOnLoglevel(log:string) {
  const logLevel = parseInt(log.charAt(1), 10);
  const colors = ['var(--opsi-log-essential)', 'var(--opsi-log-critical)', 'var(--opsi-log-error)', 'var(--opsi-log-warning)', 'var(--opsi-log-notice)', 'var(--opsi-log-info)', 'var(--opsi-log-debug)', 'var(--opsi-log-trace)', 'var(--opsi-log-secret)'];
  return colors[logLevel] || 'var(--color)';
}

function setId(id:string) {
  logrequest.selectedClient = id
}
</script>