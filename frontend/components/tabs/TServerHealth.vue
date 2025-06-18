<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-container v-loading="isLoading">
    <el-header style="height: 1px" />

    <div class="flex justify-start">
      <!-- Global filter input for healthCheck and diagnostics. It is a workaround, cause filtering in diagnostics causes loose of focus (Setting focus on input field again not really possible, cause it is then not possible to mark any text) -->
      <p-input-group class="min-w-fit border">
        <p-input-group-addon>
          <IconIIcon :icon="useIcons().filter" class="my-auto" />
        </p-input-group-addon>
        <p-input-text v-model="filter" :placeholder="$t('search')" />
      </p-input-group>
    </div>
    <el-tabs lazy v-model="activeName">
      <el-tab-pane :label="$t('healthCheck')" name="health">
        <TableTHealthCheck
          v-if="fetchedData.health_check && fetchedData.health_check.length > 0"
          v-model="fetchedData.health_check"
          :filter="filter"
        />
      </el-tab-pane>
      <el-tab-pane name="all">
        <template #label>
          <el-text class="mr-4"> {{ $t('diagnostics') }}</el-text>
          <el-button
            class="float-right mt-0 ml-2 border-1 border-white"
            type="primary"
            circle
            @click.stop="downloadHealthData"
            :aria-label="$t('download')"
            :title="$t('download')"
          >
            <IconIIcon :icon="icons.download" class="mr-1" />
          </el-button>
        </template>
        <FormFDiagnostics :data="{ ...fetchedData, health_check: void 0 }" :filter="filter" />
      </el-tab-pane>
    </el-tabs>
  </el-container>
</template>

<script setup lang="ts">
  import { useNotification } from '~/composables/mixins/useComponent'
  import type { T_health } from '~/types/tproptypes'
  import type { PropType } from 'vue'

  const { notifyError } = useNotification()
  const $t = useI18n().t
  const icons = useIcons()
  const isLoading = ref(false)
  const fetchedData = ref<any>([])
  const filter = ref('')
  onMounted(async () => {
    await fetch()
  })
  const props = defineProps({
    id: {
      type: String as PropType<T_health>,
      default: 'health' as T_health,
    },
  })
  const activeName = ref(props.id || 'health')
  useRouter().replace({ query: { id: activeName.value } })
  async function fetch() {
    isLoading.value = true
    const { data, error } = await useApiGETBody('/opsidata/server/diagnostic')
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      isLoading.value = false
      return
    }
    fetchedData.value = data?.value
    isLoading.value = false
  }
  watch(
    () => activeName.value,
    (newId) => {
      if (newId !== props.id) {
        useRouter().replace({ query: { id: newId } })
      }
    }
  )

  function downloadHealthData() {
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
