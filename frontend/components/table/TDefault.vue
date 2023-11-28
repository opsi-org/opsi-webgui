<template>

  hallo
  <pre>
    {{ fetchResult }}
  </pre>
  {{  useI18nFromComposable().f() }}
</template>


<script lang="ts" setup>
// import {  } from '@/utils/types/tbackendmethods'
import { useNotification, useI18nFromComposable } from '~/composables/mixins/useComponent';
// const tableData = ref<>()
const fetchResult = ref<any>()
onMounted(async ()=>{

  const tableData = {
    pageNumber: 1,
    perPage: 20,
    sortBy: 'depotId', // this.getKeyCookie('sorting_' + this.id, 'sortBy', 'depotId'),
    sortDesc: false, // this.getKeyCookie('sorting_' + this.id, 'sortDesc', false),
    filterQuery: ''
  }
  const params = { ...tableData, selected: '' }

  if (params.sortBy === '') { params.sortBy = 'depotId' }
  if (params.sortBy === 'selected') {
    params.sortDesc = true
    params.selected = JSON.stringify([])
  }
  const {data, error} = await useApiGETBody('/opsidata/depots', params)
  '/api/opsidata/depots'
  if (error) {
    console.log(error)
    useNotification().error(error)
    return
  }
  fetchResult.value = data;
})
</script>