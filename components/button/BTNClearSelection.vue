<template>
  <b-button
    v-b-tooltip.hover
    title="Clear selection"
    variant="light"
    size="sm"
    @click="clearselection"
  >
    <b-icon-brush />
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class BTNDeleteAll extends Vue {
  @Prop({ default: () => { return () => { /* default */ } } }) clearselection!: Function
}
</script>
