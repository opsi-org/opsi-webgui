<template>
  <el-container v-loading="isLoading">
    <el-form>
      <el-form-item :label="$t('form.modules.available')">
        <pre>{{ JSON.stringify(fetchedData.result, null, 2) }}</pre>
      </el-form-item>
    </el-form>
  </el-container>
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/mixins/useComponent';
const isLoading = ref(false)
let fetchedData = ref<any>([])
onMounted(async ()=> {
  await fetch()
})

async function fetch() {
  isLoading.value = true
  const {data, error} = await useApiGETBody('/opsidata/modulesContent')
  if (error) {
    console.error(error)
    useNotification().error(error)
    isLoading.value = false
    return
  }
  fetchedData.value = data?.value
  isLoading.value = false
}
</script>
