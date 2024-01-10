<template>
  <div>
  <el-button class="float-right" @click="useRouter().push(`/products/${route.params.producttype}`)">X</el-button>
  <ViewVConfigProduct type="product" :id="(route.params.id as string)" :is-child="true"/>
  </div>
</template>
<script setup lang="ts">
const route = useRoute()
</script>