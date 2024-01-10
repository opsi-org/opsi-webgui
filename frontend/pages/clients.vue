<template>
  <LayoutLSplitView
    :is-mobile="isMobile"
    :page0-condition="routeNameSettings?.page0Condition"
    :page1-condition="routeNameSettings?.page1Condition"
    :width="routeNameSettings?.width || width"
    :classeachcol="isMobile ? 'm-1': 'm-1 h-full'"
    >
    <!-- classlastcol="mt-0 mb-0" -->
    <template #default>
      <el-button class="float-right" v-if="routeNameSettings?.page1Condition" @click="toggleClientstableVisibility">{{'v'}}</el-button>
      <ViewVClients v-if="clientstableVisible"/>
    </template>
    <template #page1>
      <NuxtPage />
    </template>
  </LayoutLSplitView>
</template>

<script setup lang="ts">
import { usePageHelper } from '~/composables/mixins/usePageHelper';

const route = useRoute()
const {path, clientSettings } = usePageHelper()
const routeNameSettings =  computed(()=> {
  const s = clientSettings[route.name as string || '']
  if (s === undefined )
    throw new Error('route name not found: ' + (route.name as string))
  return s
})
const clientstableVisible = ref(true)
const toggleClientstableVisibility = ()=> {
  clientstableVisible.value = !clientstableVisible.value
}

const width = computed(()=> {
  if (clientstableVisible.value) {
    if (path.value.length === 3)
      return '50%' // only clients and products are visible (products have 50%)
    return '66%' // properties are open. prods and props have together 66%
  } else {
    return '90%' // prods (and props) have 90%
  }
})

const isMobile = computed(()=> {
  return useMQ().isMobile.value
})
</script>
