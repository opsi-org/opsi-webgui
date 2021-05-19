<template>
  <div>
    <b-nav-text v-if="expanded">
      {{ title }}
    </b-nav-text>
    <b-nav-text v-else />
  </div>
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
