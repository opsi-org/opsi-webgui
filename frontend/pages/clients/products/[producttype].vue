<template>
  <div>
    <LayoutLSplitView
    :is-mobile="isMobile"
    :page0-condition="path[1] === 'products'"
    :page1-condition="path[3] === 'config'"
    :width="width"
    classeachcol="m-0 p-0"
  >
    <template #default>
      <el-button class="float-right" @click="useRouter().push('/clients/')">X</el-button>
      <ViewVProducts v-if="path[1] === 'products'"
        :product-type="path[2]" :is-child="true"
      />
    </template>
    <template #page1>
      <NuxtPage />
    </template>
  </LayoutLSplitView>
  </div>
</template>
<script setup lang="ts">
const route = useRoute()
const path = computed(()=> route.path.split('/').filter((p: string)=> p !== ''))

const width = computed(()=> {
  // const routeLength = filteredPath.value.length || 1
  // return (100/routeLength)  + '%'
  return '50%'
})

const isMobile = computed(()=> {
  return useMQ().isMobile.value
})
</script>