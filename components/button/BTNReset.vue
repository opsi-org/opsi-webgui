<template>
  <b-button
    v-b-tooltip.hover
    data-testid="ButtonBTNReset"
    :aria-label="$t('button.reset')"
    :title="label? '' : $t('button.reset')"
    variant="outline-primary"
    class="reset"
    size="sm"
    @click="action"
  >
    <span class="sr-only">{{ $t('button.reset') }}</span>
    <!-- class="icon-primary" -->
    <b-icon :icon="iconnames.reset" /> <span>{{ label? '' : $t('button.reset') }} </span>
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class BTNReset extends Vue {
  iconnames:any
  @Prop({}) label?: string
  @Prop({ default: () => { return () => { /* default */ } } }) action!: Function
}
</script>
<style>
/* .reset {
  color: var(--dark) !important;
  border: none !important
}
.reset .icon-primary{
  color: var(--primary) !important;
}
.reset:hover .icon-primary{
  color: var(--light) !important;
}
.reset:hover {
  background: var(--primary) !important;
  color: var(--light) !important;
} */
</style>
