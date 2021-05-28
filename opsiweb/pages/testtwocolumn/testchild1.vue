<template>
  <div>
    <h3>test child1</h3>
    <b-button to="/testtwocolumn">
      Close
    </b-button>
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
