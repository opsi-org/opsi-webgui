<template>
  <el-container>
    <el-main v-if="(!(route.params.id?.length == 1 && route.params.id[0] == 'config'))">
      {{width}} <br />
      <!-- META: {{ route.meta.title  }} <br /> -->
      Only server: {{route.name}} <br />
      Ids: {{route.params.id}} <br />
      <br />
      <ViewVClients />
    </el-main>
    <el-aside v-if="route.params.id?.length > 0" :width="width" class="mr-5">
    <!-- <el-main v-if="route.params.id.length > 0"> -->
      <NuxtPage />
    </el-aside>
  </el-container>
</template>

<script setup lang="ts">
const route = useRoute()
const width = computed(()=> {
  const routeLength = route.params.id?.length || 1
  return (100/routeLength)  + '%'
})
</script>
