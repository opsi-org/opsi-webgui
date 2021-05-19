<template>
  <div>
    <b-nav-item>
      <b-icon :icon="icon" />
      <span v-if="expanded">
        {{ title }}
      </span>
    </b-nav-item>
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
    },
    icon: {
      type: String,
      default: ''
    }
  }
})
</script>
