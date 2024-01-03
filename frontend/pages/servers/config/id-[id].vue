<template>
  <div>
    {{ $route.params.id }} <br />
    {{ id }}
    <ViewVConfig :type="type" :id="id" :is-child="false"/>
  </div>
</template>

<script setup lang="ts">
const type = 'depots'
const id = ref(useRoute().params.id)
</script>