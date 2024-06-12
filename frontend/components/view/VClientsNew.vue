<template>
  <!-- {{ fetchedData }} -->
  <el-table :data="fetchedData" v-loading="isLoading" style="width: 100%">
    <el-table-column prop="clientId" label="Client ID"></el-table-column>
    <el-table-column prop="macAddress" label="MAC"></el-table-column>
    <!-- <el-table-column v-for="column in tableColumn" :key="column.key" :prop="column.key" :label="column.title">
    </el-table-column> -->
  </el-table>
</template>
<script setup lang="ts">
import type { T_ClientsList } from '~/types/APItypes';
import { useNotification } from '~/composables/mixins/useComponent';
const { notifyError } = useNotification()
const storeSelection = storeSelections()
const $t = useI18n().t

let fetchedData = ref({} as T_ClientsList)
const isLoading = ref(false)

// const tableColumn = ref([
//   {title: 'Client ID', key: 'clientId', sortable: true},
//   {title: 'MAC', key: 'macAddress', sortable: false},
//   // Add more columns as needed
// ])

onMounted(() => {
  fetchClients()
})

async function fetchClients() {
  isLoading.value = true
  const params = { filterQuery: '', pageNumber: 1, perPage: 10, sortBy:'clientId',
  sortDesc:true, selected: JSON.stringify(storeSelection.selectionClients),
  selectedDepots: JSON.stringify(storeSelection.selectionDepots)}
  try {
    const {data, error} = await useApiGETBody<T_ClientsList>('/opsidata/clients', params)
      if (error) {
      notifyError({ message: error?.response?.data?.message || $t('message.error.generic') })
      return
    }
    if (data.value == undefined) {
      notifyError({ message: $t('message.error.empty-response') })
      return
    }
    fetchedData.value = data.value
  } catch (error) {
    notifyError({ message: $t('message.error.unexpected') })
  } finally {
    isLoading.value = false
  }
}
</script>