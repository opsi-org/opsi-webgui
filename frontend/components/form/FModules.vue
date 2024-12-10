<template>
  <el-row v-loading="isLoading">
    <b>{{ $t('form.modules.available') }}</b>
  </el-row>
  <div v-for="(module, index) in fetchedData.result" :key="index" class="ml-5">
    <el-text> {{ module }} </el-text>
  </div>
</template>

<script setup lang="ts">
  import { useNotification } from '~/composables/mixins/useComponent'
  const { notifyError } = useNotification()
  const isLoading = ref(false)
  const fetchedData = ref<any>([])
  const $t = useI18n().t
  onMounted(async () => {
    await fetch()
  })

  async function fetch() {
    isLoading.value = true
    const { data, error } = await useApiGETBody('/opsidata/modulesContent')
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      isLoading.value = false
      return
    }
    fetchedData.value = data?.value
    isLoading.value = false
  }
</script>
