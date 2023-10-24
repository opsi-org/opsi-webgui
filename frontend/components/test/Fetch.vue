<template>
  <div ref="target">
    <p v-if="pending">Fetching...</p>
    <pre v-else-if="error">Could not load data: {{ error.data }}</pre>
    <figure v-else>
      {{data}}
    </figure>
  </div>
</template>

<script setup>
const { data, error, pending } = await useApiFetch('/user/opsiserver', {
  method: "GET"
})
</script>
