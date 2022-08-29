<template>
  <b-button
    v-b-tooltip.hover
    data-testid="BTNClearSelection"
    :aria-label="$t('table.selection.clear')"
    :title="label? '' : $t('table.selection.clear')"
    variant="outline-primary"
    class="ml-0 border-0"
    size="sm"
    @click="clearselection"
  >
    <span class="sr-only">{{ $t('table.selection.clear') }}</span>
    <b-icon :icon="iconnames.clear" />
    <span v-if="showLabel" class="clearButton">{{ label? label: $t('table.selection.clear') }} </span>
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import * as mixin from '../../mixins/uib-mixins'

@Component({ mixins: [mixin.Constants] })
export default class BTNClearSelection extends Vue {
  iconnames:any
  @Prop({}) label?: string
  @Prop({ default: true }) showLabel?: boolean
  @Prop({ default: () => { return () => { /* default */ } } }) clearselection!: Function
}
</script>
