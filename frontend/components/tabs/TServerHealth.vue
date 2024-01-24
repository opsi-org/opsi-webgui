<template>
  <IconILoading v-if="isLoading" />

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
</script>
