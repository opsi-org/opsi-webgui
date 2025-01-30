<template>
  <Icon :icon="icon" v-bind="$attrs" :class="$attrs.class" />
</template>

<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  const _props = defineProps({
    icon: {
      type: String,
      required: true,
    },
  })
</script>
