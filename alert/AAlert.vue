<template>
  <b-alert
    v-bind="$props"
    :aria-label="$props.variant"
  >
    <slot></slot>
  </b-alert>
</template>

<script lang="ts">
import { Component } from 'nuxt-property-decorator'
import { BAlert } from 'bootstrap-vue'

@Component
export default class DDDefault extends BAlert {
}
</script>
<style>
</style>
