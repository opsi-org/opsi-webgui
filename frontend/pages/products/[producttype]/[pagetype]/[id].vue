<template>
  <div>
    <el-text tag="b" class="text-capitalize after:content-['-']">
      {{ $t('title.properties') }}
    </el-text>
    <el-text tag="i"> {{ route.params.id }} </el-text>
    <el-button
      class="float-right"
      @click="router.push(`/products/${route.params.producttype}`)"
      ><IconIIcon :icon="icons.x"
    /></el-button>
    <ViewVConfigProduct
      type="product"
      :id="route.params.id as string"
      :is-child="true"
    />
  </div>
</template>
<script setup lang="ts">
  import { useIcons } from '~/composables/mixins/useIcons'

  const $t = useI18n().t
  const route = useRoute()
  const router = useRouter()
  const icons = useIcons()
</script>
