<template>
  <el-container v-loading="isLoading">
    <el-header style="height: 32px">
      <el-button class="float-right" @click="downloadHealthData"><IconIIcon :icon="icons.download" /> {{ $t('button.download') }}</el-button>
    </el-header>
    <el-tabs lazy>
      <el-tab-pane :label="$t('title.healthcheck')">
        <TableTHealthCheck v-if="fetchedData.health_check && fetchedData.health_check.length > 0" :data="fetchedData.health_check" />
      </el-tab-pane>
      <el-tab-pane :label="$t('title.diagnostics')">
        <FormFDiagnostics :data="{...fetchedData, health_check: void(0)}" />
      </el-tab-pane>
    </el-tabs>
  </el-container>
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/mixins/useComponent';
import {useIcons} from '../../composables/mixins/useIcons'
const { notifyError } = useNotification()
const $t = useI18n().t
const icons = useIcons()
const isLoading = ref(false)
const fetchedData = ref<any>([])

onMounted(async ()=> {
  await fetch()
})

async function fetch() {
  isLoading.value = true
  const {data, error} = await useApiGETBody('/opsidata/server/diagnostic')
  if (error) {
    notifyError({ message: error?.response?.data?.message })
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
