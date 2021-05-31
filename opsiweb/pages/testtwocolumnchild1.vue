<template>
  <div>
    <h3>child1</h3>
    <b-table striped hover :items="items" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data () {
    return {
      items: [
        { age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
        { age: 21, first_name: 'Larsen', last_name: 'Shaw' }
      ]
    }
  }
})
</script>
