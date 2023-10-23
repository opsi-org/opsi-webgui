<template>
  <div>
    {{  counterStore.counter }}
      <b-button @click="counterStore.increment()"> increment </b-button>
  </div>
</template>

<script setup>
const counterStore = useMainStore()
</script>
