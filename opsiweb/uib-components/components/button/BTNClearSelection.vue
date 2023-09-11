<template>
  <b-button
    data-testid="BTNClearSelection"
    :aria-label="$t('table.selection.clear')"
    :title="showLabel? '' : $t('table.selection.clear')"
    variant="outline-primary"
    class="ml-0 border-0"
    :class="short !== false ? '' : 'w-100'"
    size="sm"
    @click="clearselection"
  >
    <span class="sr-only">{{ $t('table.selection.clear') }}</span>
    <b-icon :icon="icon.clear" />
    <span v-if="showLabel" class="clearButton">{{ label? label: $t('table.selection.clear') }} </span>
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons] })
export default class BTNClearSelection extends Vue {
  icon:any
  @Prop({}) label?: string
  @Prop({ default: true }) showLabel?: boolean
  @Prop({ default: false }) short?: boolean
  @Prop({ default: () => { return () => { /* default */ } } }) clearselection!: Function
}
</script>
