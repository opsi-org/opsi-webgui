<template>
  <FormFCloneClient :id="id" :as-child="false" />
</template>

<script setup lang="ts">

const id = computed(()=>useRoute().params.id as string || undefined)
const type = computed(()=>useRoute().params.pagetype)
</script>
