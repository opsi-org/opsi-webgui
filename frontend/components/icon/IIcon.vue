<template>
  <Icon v-bind="$attrs as any" :class="props.class"/>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
const props = defineProps({
  class: { type: String, default: '' }
})
</script>

