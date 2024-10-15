<template>
  <ViewVConfig :type="type" :is-child="false" :id="id"/>
</template>

<script setup lang="ts">
import { usePageHelper } from '~/composables/mixins/usePageHelper';


const type = computed(()=> usePageHelper().path.value[0])
const id = computed(()=>useRoute().params.id as string || undefined)
// const pagetype = computed(()=>useRoute().params.pagetype)
</script>
