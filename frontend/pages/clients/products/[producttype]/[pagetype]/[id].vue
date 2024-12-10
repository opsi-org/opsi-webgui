<template>
  <div>
    <el-button
      class="float-right"
      @click="router.push(`/clients/products/${route.params.producttype}`)"
    >
      <IconIIcon :icon="icons.x" />
    </el-button>
    <ViewVConfigProduct
      type="product"
      :id="route.params.id as string"
      :is-child="true"
    />
  </div>
</template>
<script setup lang="ts">
  import { useIcons } from '~/composables/mixins/useIcons'

  const route = useRoute()
  const router = useRouter()
  const icons = useIcons()
</script>
