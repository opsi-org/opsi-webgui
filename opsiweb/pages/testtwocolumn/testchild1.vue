<template>
  <div>
    <BarBPageHeader title="Test Child1" closeroute="/testtwocolumn" />
    <TableTDefault :tableitems="items" />
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
