<template>
  <div>
    <b-navbar>
      <span><b>{{ title }}</b></span>
      <slot name="filter" />
      <slot name="logtype" />
      <slot name="loglevel" />
      <b-navbar-nav class="ml-auto">
        <slot name="clientdelete" />
        <slot name="clientrename" />
        <b-button :to="closeroute">
          <b-icon icon="x" />
        </b-button>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    title: {
      type: String,
      default: ''
    },
    closeroute: {
      type: String,
      default: ''
    }
  }
})
</script>

<style>
</style>
