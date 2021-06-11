<template>
  <div>
    <b-navbar :class="{pageheader: $mq === 'desktop', pageheader_wrap: $mq === 'mobile'}">
      <span v-if="navbartype=='collapse'">
        <b-icon v-if="collapsed" icon="chevron-double-down" />
        <b-icon v-else icon="chevron-double-right" />
      </span>
      <b>{{ title }}</b>
      <slot name="filter" />
      <slot name="selection" />
      <slot name="log" />
      <b-navbar-nav class="ml-auto">
        <slot name="clientdelete" />
        <slot name="clientrename" />
        <slot name="formreset" />
        <slot name="clientadd" />
        <b-button v-if="closeroute" :to="closeroute">
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
    navbartype: {
      type: String,
      default: 'default'
    },
    collapsed: {
      type: Boolean,
      default: false
    },
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
.pageheader{
  height: var(--height-navbar) !important;
}
.pageheader_wrap {
  display: flex;
  flex-wrap: wrap;
}
</style>
