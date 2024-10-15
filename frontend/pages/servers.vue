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
      <el-button class="float-right" v-if="routeNameSettings?.page1Condition" @click="toggleClientstableVisibility">{{'v'}}</el-button>
      <ViewVServer v-if="maintableVisible"/>
    </template>
    <template #page1>
      <NuxtPage />
    </template>
  </LayoutLSplitView>
</template>

<script setup lang="ts">
import { usePageHelper, type PageSettings } from '~/composables/mixins/usePageHelper';
import { useMQ } from '../composables/useMQ';

const mq = useMQ()
const route = useRoute()
const {path, serverSettings } = usePageHelper()

const maintableVisible = ref(true)

const routeNameSettings =  computed<PageSettings>(()=> {
  if (route.name === undefined){
    throw new Error('route name not found [0]: undefined')
  }
  const key = route.name as string
  if (Object.keys(serverSettings).includes(key))  {
    const s:PageSettings = serverSettings[key]
    if (s === undefined )
      throw new Error('route name not found [1]: ' + (key))
    return s
  }
  throw new Error('route name not found [2]: ' + (key))
})

const width = computed(()=> {
  if (maintableVisible.value) {
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


function toggleClientstableVisibility () {
  maintableVisible.value = !maintableVisible.value
}

</script>


<!-- <template>
  <LayoutLSplitView
    :is-mobile="true"
    :page0-condition="(!(route.params.id?.length == 1 && route.params.id[0] == 'config'))"
    :page1-condition="route.params.id?.length > 0"
    :width="width"
  >
    <template #default>
      <ViewVServer />
    </template>
    <template #page1>
      <NuxtPage />
    </template>
  </LayoutLSplitView>
</template>

<script setup lang="ts">
const route = useRoute()
const width = computed(()=> {
  const routeLength = route.params.id?.length || 1
  return (100/routeLength)  + '%'
})
</script> -->