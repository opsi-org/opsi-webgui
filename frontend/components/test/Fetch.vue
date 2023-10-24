<template>
  <div ref="target">
    <p v-if="fetchResult.pending">Fetching...</p>
    <pre v-else-if="fetchResult.error">Could not load data: {{ error.data }}</pre>
    <figure v-else>
      Result {{ fetchResult.value.result }} <br />
    </figure>
  </div>
</template>

<script setup>
// const result = ref()
// onMounted( async () => {
//   // console.log(`the component is now mounted.`)
//   const { data, error, pending, status } = await useApiFetch('/user/opsiserver', { }).get()
//   result.value = data
// })
// const result = computed({ get: () => data ? JSON.parse(data) : data })

const fetchResult = ref({});

onMounted( async () => {
  const { data: result } = await $fetch('/user/opsiserver').get().json()
  // const { data } = await useApiFetch('/user/opsiserver').get()
//   // const { data: response } = await useAsyncData('directories', () => $fetch('/api/s3-get-directories'));
  fetchResult.value = result;
  console.log("fetch local result", result)
  console.log("fetch global result", fetchResult)
});
</script>
