<template>
  <b-nav-item v-if="expanded" disabled>
    {{ title }}
  </b-nav-item>
  <b-nav-item v-else disabled />
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    expanded: Boolean,
    title: {
      type: String,
      default: ''
    }
  }
})
</script>

<style>
.nav-tabs .nav-link.disabled {
  color: black;
}
</style>
