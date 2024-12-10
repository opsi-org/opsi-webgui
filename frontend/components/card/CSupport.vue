<template>
  <el-card shadow="hover">
    <template #header>
      <h2>{{ $t(item.title) }}</h2>
    </template>
    <el-text> {{ $t(item.description) }}</el-text>
    <br />
    <el-link :href="item.link" target="_blank" type="primary">{{
      $t(item.buttonname)
    }}</el-link>
  </el-card>
</template>

<script setup lang="ts">
  const _props = defineProps({
    item: { type: Object, required: true },
  })
  const $t = useI18n().t
</script>
