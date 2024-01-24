<template>
  <el-tabs>
    <el-tab-pane :label="$t('title.healthcheck')">
      {{ $t('title.healthcheck') }}
      {{ healthCheck }}
    </el-tab-pane>
    <el-tab-pane :label="$t('title.diagnostics')">
      {{ $t('title.diagnostics') }}
      {{ diagnostics }}
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/mixins/useComponent';
let fetchedData = ref<any>()
let healthCheck: any[] = []
let diagnostics: any[] = []

onMounted(async ()=> {
  await fetch()
})

async function fetch() {
  const {data, error} = await useApiGETBody('/opsidata/server/diagnostic')
  if (error) {
    console.log(error)
    useNotification().error(error)
    return
  }
  fetchedData.value = data.value
  healthCheck = data?.value?.health_check
  diagnostics = {...data?.value, health_check: void(0)}
  // const { health_check, ...diagnostics } = data.value
}
</script>
