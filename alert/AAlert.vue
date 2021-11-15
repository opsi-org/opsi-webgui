<template>
  <b-alert
    v-bind="$props"
    :aria-label="$props.variant"
  >
    This is a test - from merge-request 188-test-ticket-submodules
    <slot />
  </b-alert>
</template>

<script lang="ts">
import { Component } from 'nuxt-property-decorator'
import { BAlert } from 'bootstrap-vue'

@Component
export default class AAlert extends BAlert {
}
</script>
<style>
</style>
