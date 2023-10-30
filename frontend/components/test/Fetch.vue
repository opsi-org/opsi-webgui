<template>
  <p v-if="fetchResult.pending">Fetching...</p>
  <pre v-else-if="fetchResult.error">Could not load data: {{ error.data }}</pre>
  <div v-else>
    Result: {{ typeof fetchResult }} <br />
    Result: {{ fetchResult }} <br />
  </div>
</template>

<script setup>
const fetchResult = ref({});
onMounted( async () => {
  const { data } = await useAPI('/user/opsiserver').get().json()
  fetchResult.value = data;
});
</script>
