<template>
  <pre v-if="fetchError">Could not load data</pre>
  <p v-else-if="fetchResult === undefined">Fetching...</p>
  <div v-else>
    Result-Type: {{ typeof fetchResult }} <br />
    Result-Data: {{ fetchResult }} <br />
  </div>
</template>

<script setup>
import { useNotification } from '~/composables/mixins/useComponents';

const fetchResult = ref(undefined);
const fetchError = ref(false);

onMounted( async () => {
  const { data, error } = await useApiGET('/user/opsiserver')
  if (error) {
    useNotification().error(error)
    fetchError.value = error;
    return
  }
  fetchResult.value = data;
});
</script>
