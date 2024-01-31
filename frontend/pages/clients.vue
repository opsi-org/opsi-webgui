<template>
  <LayoutLSplitView
    :is-mobile="isMobile"
    :page0-condition="routeNameSettings?.page0Condition"
    :page1-condition="routeNameSettings?.page1Condition"
    :width="routeNameSettings?.width || width"
    classeachcol=""
    >
    <!-- :classeachcol="isMobile ? 'm-1': 'm-1 h-full'" -->
    <!-- classlastcol="mt-0 mb-0" -->
    <template #default>
      <el-button class="float-right" v-if="routeName.startsWith('clients-products') && routeNameSettings?.page1Condition" @click="toggleClientstableVisibility">{{'v'}}</el-button>
      <ViewVClients v-if="clientstableVisible" :is-mobile="mq.isMobile.value"/>
    </template>
    <template #page1>
      <NuxtPage />
    </template>
  </LayoutLSplitView>
</template>

<script setup lang="ts">
import { usePageHelper } from '~/composables/mixins/usePageHelper';
import { useMQ } from '../composables/useMQ';

const mq = useMQ()
const route = useRoute()
const {path, clientSettings } = usePageHelper()

const clientstableVisible = ref(true)


const routeName = computed(()=> route.name as string || '')
const routeNameSettings =  computed(()=> {
  const s = clientSettings[routeName.value]
  if (s === undefined )
    throw new Error('route name not found: ' + (route.name as string))
  return s
})
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
  return mq.isMobile.value
})
</script>

<style scoped>

</style>