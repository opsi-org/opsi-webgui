<template>
  <b-button
    :variant="variant"
    data-testid="ButtonBTNRowLinkTo"
    :class="{'border-0 w-100 h-100 text-left': true, 'dropdown-item': incontextmenu}"
    :title="label ? '' : title"
    size="sm"
    :pressed="pressed(to, ident, sortby)"
    :aria-label="title"
    @click="action"
  >
    <b-icon v-if="icon" :icon="icon" />
    <template v-if="label && ($mq!=='mobile' || incontextmenu)">
      <small class="label" style="font-size: 85%;">{{ label }}</small>
    </template>
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class BTNRowLinkTo extends Vue {
  @Prop({ }) pressed!: Function
  @Prop({ }) click!: Function|undefined
  @Prop({ }) clickParent!: Function
  @Prop({ }) to!: string
  @Prop({ }) sortby!: string
  @Prop({ }) ident!: string
  @Prop({ }) label?: string
  @Prop({ default: false }) incontextmenu!: boolean
  @Prop({ default: 'title' }) title!: string
  @Prop({ default: '' }) icon!: string
  @Prop({ default: 'outline-primary' }) variant!: string
  $mq: any

  action () {
    if (this.click !== undefined) {
      this.click(this.to, this.ident)
    } else if (this.clickParent !== undefined) {
      this.clickParent(this.to, this.ident)
    } else {
      // eslint-disable-next-line no-console
      console.error('no action defined')
    }
  }
}
</script>
