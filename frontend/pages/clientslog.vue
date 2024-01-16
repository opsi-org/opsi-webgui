<template>
  <ViewVClientsLog :id.sync="id" :as-child="false">
    <!-- <template slot="IDSelection">
      <TreeTSClientsNotStored :id.sync="id" />
    </template> -->
  </ViewVClientsLog>
</template>

<script setup lang="ts">
const id = computed(()=>useRoute().params.id as string || undefined)
</script>

