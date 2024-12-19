<template>
  <el-form
    label-width="50%"
    :label-position="mq.isMobile.value ? 'top' : 'left'"
    v-loading="isLoading"
  >
    <el-form-item>
      <template #label
        ><h3 class="text-lg font-semibold">
          {{ $t('form.modules.available') }}
        </h3></template
      >
      <ul>
        <li
          v-for="(module, index) in fetchedData.result"
          :key="index"
          class="mb-2"
        >
          <el-tag type="info" class="w-32 text-center">{{ module }}</el-tag>
        </li>
      </ul>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
  import { useNotification } from '~/composables/mixins/useComponent'
  const { notifyError } = useNotification()
  const isLoading = ref(false)
  const fetchedData = ref<any>([])
  const $t = useI18n().t
  const mq = useMQ()
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
