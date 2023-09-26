<template>
  <b-button
    data-testid="ButtonBTNReset"
    :aria-label="$t('button.reset')"
    :title="label? '' : $t('button.reset')"
    variant="outline-primary"
    class="reset"
    :class="{'w-100': w100}"
    size="sm"
    @click="action"
  >
    <span class="sr-only">{{ $t('button.reset') }}</span>
    <b-icon :icon="icon.reset" /> <span class="resetButton">{{ label? '' : $t('button.reset') }} </span>
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons] })
export default class BTNReset extends Vue {
  icon:any
  @Prop({}) label?: string
  @Prop({}) w100?: boolean
  @Prop({ default: () => { return () => { /* default */ } } }) action!: Function
}
</script>
