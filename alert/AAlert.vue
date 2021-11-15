<template>
  <b-alert
    v-bind="$props"
    :aria-label="$props.variant"
  >
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
