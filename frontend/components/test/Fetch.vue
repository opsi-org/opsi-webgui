<template>
  <p v-if="fetchResult.pending">Fetching...</p>
  <pre v-else-if="fetchResult.error">Could not load data: {{ error.data }}</pre>
  <div v-else>
    Result: {{ fetchResult.value.result }} <br />
  </div>
</template>

<script setup>
const fetchResult = ref({});
onMounted( async () => {
  const { data: result } = await $fetch('/user/opsiserver').get().json()
  fetchResult.value = result;
});
</script>
