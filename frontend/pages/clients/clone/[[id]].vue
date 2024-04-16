<template>
  <FormFCloneClient type="clients" :is-child="false" :id="id" />
</template>

<script setup lang="ts">

const id = computed(()=>useRoute().params.id as string || undefined)
</script>
