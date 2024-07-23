<template>
  <div>
  <el-text tag="b" class="text-capitalize"> {{ $t('title.properties') }} </el-text> - <el-text tag="i"> {{ route.params.id }} </el-text>
  <el-button class="float-right" @click="useRouter().push(`/products/${route.params.producttype}`)">X</el-button>
  <ViewVConfigProduct type="product" :id="(route.params.id as string)" :is-child="true"/>
  </div>
</template>
<script setup lang="ts">
const route = useRoute()
</script>