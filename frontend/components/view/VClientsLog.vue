<template>
  <el-form :inline="true" label-position="top" class="mt-2" v-loading="isLoading">
    <!-- <el-button @click="fetch" type="primary" icon="el-icon-refresh" :loading="isLoading" :disabled="isLoading" :class="{ 'd-none': props.isChild }">
      {{ $t('label.reloadPage') }}
    </el-button> -->
    <el-form-item :label="$t('form.clientId')" v-if="!props.isChild">
      <SelectSHosts :type="type" @change="setId" :id="logrequest.selectedClient" />
    </el-form-item>
    <el-form-item :label="$t('form.logtype')">
      <el-select v-model="logtype" style="min-width: 200px">
        <el-option v-for="lt in logTypes" :key="lt" :label="lt" :value="lt" />
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
  <el-scrollbar  v-if="fetchedData.length > 1">
    <span
      v-for="log in filteredData"
      :key="log"
      :class="{ 'hidden': !isLoglevelSmaller(log), [getColorBasedOnLoglevel(log)]: true }"
      >
      <!-- :style="{ color: getColorBasedOnLoglevel(log) }" -->
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
const settings = storeSettings()

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

const COLORS_LIGHT = ['text-opsi-log-light-essential', 'text-opsi-log-light-critical', 'text-opsi-log-light-error', 'text-opsi-log-light-warning', 'text-opsi-log-light-notice', 'text-opsi-log-light-info', 'text-opsi-log-light-debug', 'text-opsi-log-light-trace', 'text-opsi-log-light-secret'];
const COLORS_DARK = ['text-opsi-log-dark-essential', 'text-opsi-log-dark-critical', 'text-opsi-log-dark-error', 'text-opsi-log-dark-warning', 'text-opsi-log-dark-notice', 'text-opsi-log-dark-info', 'text-opsi-log-dark-debug', 'text-opsi-log-dark-trace', 'text-opsi-log-dark-secret'];

watch([()=>props.id, ()=>logtype.value, loglevel.value], fetch, { immediate: true })


const isDarkMode = computed({
  get: () => settings.colormode === 'dark',
  set: (value: boolean) => {
    settings.setColormode(value ? 'dark' : 'light');
  }
});

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

function isLoglevelSmaller (logrow:string) {
  const rxSelf2 = new RegExp('^((\\[[0-' + loglevel.value + ']\\])|[^\\[0-9\\]])', 'g')
  const result = RegExp(rxSelf2).exec(logrow)
  return !!result
}

function getColorBasedOnLoglevel(log:string) {
  const logLevel = parseInt(log.charAt(1), 10);
  return (isDarkMode.value ? COLORS_DARK[logLevel] : COLORS_LIGHT[logLevel]) || 'text-inherit';
}

function setId(id:string) {
  logrequest.selectedClient = id
}
</script>