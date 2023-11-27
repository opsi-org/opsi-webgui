<template>
  <Icon v-bind="$attrs" />
  <!-- <Icon v-if="!isStackedIcon" v-bind="$attrs" />
  <div v-else>not supported now</div> -->
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useIcons } from '../../composables/mixins/useIcons';
// import { computed } from '@vue/reactivity';
// import { useAttrs } from 'vue'
const icons = useIcons()
// const attrs = useAttrs()
// const isStackedIcon = computed(()=> {
//   // return false
//   // console.log(icons._stackedIcons)
//   console.log(Object.keys(icons._stackedIcons))
//   return Object.keys(icons._stackedIcons).includes(attrs.icon as string)
// })
</script>

