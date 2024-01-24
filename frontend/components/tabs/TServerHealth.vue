<template>
  <el-header style="height: 32px">
    <IconILoading v-if="isLoading" />
    <el-button class="float-right" @click="downloadHealthData"><IconIIcon :icon="icons.download" /> {{ $t('button.download') }}</el-button>
  </el-header>
  <el-tabs>
    <el-tab-pane :label="$t('title.healthcheck')">
      <!-- {{ fetchedData.health_check }} -->
      <el-table :data="fetchedData.health_check">
        <el-table-column prop="check_name" label="Check Name" width="180" />
        <el-table-column prop="check_description" label="Description" width="180" />
        <el-table-column prop="check_status" label="Status" />
      </el-table>
    </el-tab-pane>
    <el-tab-pane :label="$t('title.diagnostics')">
      <!-- {{ {...fetchedData, health_check: void(0)} }} -->
      <pre>{{ JSON.stringify({...fetchedData, health_check: void(0)}, null, 2) }}</pre>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/mixins/useComponent';
import {useIcons} from '../../composables/mixins/useIcons'
const icons = useIcons()
const isLoading = ref(false)
let fetchedData = ref<any>([])
// let healthCheck: any[] = []
// let diagnostics: any[] = []

onMounted(async ()=> {
  await fetch()
})

async function fetch() {
  isLoading.value = true
  const {data, error} = await useApiGETBody('/opsidata/server/diagnostic')
  if (error) {
    console.log(error)
    useNotification().error(error)
    isLoading.value = false
    return
  }
  fetchedData.value = data?.value
  isLoading.value = false
  // healthCheck = data?.value?.health_check
  // diagnostics = {...data?.value, health_check: void(0)}
}

function downloadHealthData () {
  const text = JSON.stringify(fetchedData.value, null, 2)
  const filename = 'server_diagnostics.json'
  const element = document.createElement('a')
  element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text))
  element.setAttribute('download', filename)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}
</script>
