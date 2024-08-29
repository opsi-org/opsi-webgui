<template>
  <el-card shadow="hover">
    <template #header>
      <el-text tag="b"> {{ $t(item.title) }}</el-text>
    </template>
    <el-text> {{ $t(item.description) }}</el-text>
    <br />
    <el-link :href="item.link" target="_blank" style="--el-link-hover-text-color: var(--opsi-general-red)">{{
      $t(item.buttonname)
    }}</el-link>
  </el-card>
</template>

<script setup lang="ts">
  const props = defineProps({
    item: { type: Object, required: true },
  })
  const $mq = useMQ().$mq
  const textClass = computed(() => ($mq.value === 'mobile' ? 'smallText' : 'normalText'))
</script>
