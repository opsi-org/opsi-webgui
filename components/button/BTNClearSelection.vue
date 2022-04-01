<template>
  <b-button
    v-b-tooltip.hover
    aria-label="clearSelection"
    :title="label? '' : $t('table.selection.clear')"
    variant="transparent"
    class="ClearSelection"
    size="sm"
    @click="clearselection"
  >
    <span class="sr-only">{{ $t('table.selection.clear') }}</span>
    <b-icon :icon="iconnames.clear" class="icon-primary" />
    <span v-if="showLabel">{{ label? label: $t('table.selection.clear') }} </span>
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class BTNDeleteAll extends Vue {
  iconnames:any
  @Prop({}) label?: string
  @Prop({ default: true }) showLabel?: boolean
  @Prop({ default: () => { return () => { /* default */ } } }) clearselection!: Function
}
</script>
<style>
.ClearSelection {
  color: var(--dark) !important;
  border: none !important
  /* background: green !important; */
}
.ClearSelection .icon-primary{
  color: var(--primary) !important;
}
.ClearSelection:hover .icon-primary{
  color: var(--light) !important;
}
.ClearSelection:hover {
  background: var(--primary) !important;
  color: var(--light) !important;
}
</style>
