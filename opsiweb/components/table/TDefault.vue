<template>
  <b-container fluid>
    <b-table striped hover :items="tableitems" />
  </b-container>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    tableitems: {
      type: Array,
      default () {
        return []
      }
    }
  }
})
</script>
