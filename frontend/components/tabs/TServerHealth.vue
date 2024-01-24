<template>
  <el-header style="height: 32px">
    <IconILoading v-if="isLoading" />
    <el-button class="float-right" @click="downloadHealthData"><IconIIcon :icon="icons.download" /> {{ $t('button.download') }}</el-button>
  </el-header>
  <el-tabs>
    <el-tab-pane :label="$t('title.healthcheck')">
      <TableTHealthCheck :data="fetchedData" />
    </el-tab-pane>
    <el-tab-pane :label="$t('title.diagnostics')">
      <FormFDiagnostics :data="{...fetchedData, health_check: void(0)}" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/mixins/useComponent';
import {useIcons} from '../../composables/mixins/useIcons'
const icons = useIcons()
const isLoading = ref(false)
let fetchedData = ref<any>([])

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
