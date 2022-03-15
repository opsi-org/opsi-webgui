<template>
  <b-button
    v-b-tooltip.hover
    aria-label="clearSelection"
    :title="label? '' : 'Clear selection'"
    variant="transparent"
    size="sm"
    @click="clearselection"
  >
    <slot />
    <b-icon-brush variant="primary" /> <span>{{ label }} </span>
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class BTNDeleteAll extends Vue {
  @Prop({}) label?: string;
  @Prop({ default: () => { return () => { /* default */ } } }) clearselection!: Function
}
</script>
