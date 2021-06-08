<template>
  <div>
    <b-row>
      <b-col :class="{'d-none' : showchild && $mq === 'mobile'}">
        <slot name="parent" />
      </b-col>
      <b-col v-if="showchild">
        <slot name="child" />
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    breadcrumb: {
      type: String,
      default: ''
    },
    showchild: Boolean
  }
})
</script>
