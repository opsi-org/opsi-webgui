<template>
  <div>
    <BarBPageHeader :title="'Test Child1'" :closeroute="'/testtwocolumn'" />
    <b-table striped hover :items="items" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    items: {
      type: Array,
      default () {
        return []
      }
    }
  }
})
</script>
