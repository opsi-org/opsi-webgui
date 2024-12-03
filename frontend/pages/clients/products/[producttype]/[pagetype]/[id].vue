<template>
  <div>
    <!-- <pre>{{ route.params }}</pre> -->
    <el-button
      class="float-right"
      @click="router.push(`/clients/products/${route.params.producttype}`)"
      >X</el-button
    >
    <ViewVConfigProduct
      type="product"
      :id="route.params.id as string"
      :is-child="true"
    />
  </div>
</template>
<script setup lang="ts">
  const route = useRoute()
  const router = useRouter()
</script>
