<template>
  <el-container>
    <el-main v-if="(!(route.params.id?.length == 1 && route.params.id[0] == 'config'))">
      {{width}} <br />
      <!-- META: {{ route.meta.title  }} <br /> -->
      Only server: {{route.name}} <br />
      Ids: {{route.params.id}} <br />
      <br />
      <ViewVServer />
    </el-main>
    <el-aside v-if="route.params.id?.length > 0" :width="width" >
    <!-- <el-main v-if="route.params.id.length > 0"> -->
      <NuxtPage />
    </el-aside>
  </el-container>
</template>

<script setup lang="ts">
const route = useRoute()
// definePageMeta({
//   title: 'My servers page'
// })
// const width = ref('100%')
// watch(()=>route.params.id, ()=>{
//   console.log('route.params.id', route.params.id)
//   const routeLength = route.params.id?.length || 1
//   width.value = (100/routeLength)  + '%'
// }, {deep: true})
const width = computed(()=> {
  const routeLength = route.params.id?.length || 1
  return (100/routeLength)  + '%'
})
</script>