<template>
  <b-button
    v-b-tooltip.hover
    aria-label="clearSelection"
    :title="label? '' : $t('table.selection.clear')"
    variant="transparent"
    size="sm"
    @click="clearselection"
  >
    <span class="sr-only">{{ $t('table.selection.clear') }}</span>
    <b-icon :icon="iconnames.clear" variant="primary" /> <span>{{ label }} </span>
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class BTNDeleteAll extends Vue {
  iconnames:any
  @Prop({}) label?: string;
  @Prop({ default: () => { return () => { /* default */ } } }) clearselection!: Function
}
</script>
