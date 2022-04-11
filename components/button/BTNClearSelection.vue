<template>
  <b-button
    v-b-tooltip.hover
    aria-label="clearSelection"
    :title="label? '' : $t('table.selection.clear')"
    variant="outline-primary"
    class="ClearSelection border-0"
    size="sm"
    @click="clearselection"
  >
    <span class="sr-only">{{ $t('table.selection.clear') }}</span>
    <b-icon :icon="iconnames.clear" />
    <span v-if="showLabel">{{ label? label: $t('table.selection.clear') }} </span>
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class BTNClearSelection extends Vue {
  iconnames:any
  @Prop({}) label?: string
  @Prop({ default: true }) showLabel?: boolean
  @Prop({ default: () => { return () => { /* default */ } } }) clearselection!: Function
}
</script>
