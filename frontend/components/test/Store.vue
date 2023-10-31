<template>
  <div>
    {{  counterStore.counter }}
      <b-button variant="primary" @click="counterStore.increment()"> BootstrapVue increment </b-button>
  </div>
</template>

<script setup>
const counterStore = useMainStore() // from testStore
// better example: storeAuth()
</script>
