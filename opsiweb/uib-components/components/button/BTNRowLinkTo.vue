<template>
  <b-button
    :variant="variant"
    data-testid="ButtonBTNRowLinkTo"
    :class="{
      'w-100 h-100 text-left d-flex': true,
      'dropdown-item border-0 incontextmenu': incontextmenu,
      [classes]: true,
    }"
    :title="label ? '' : title"
    size="sm"
    :pressed="pressed(to, ident, sortby)"
    :aria-label="title"
    @click="action"
  >
    <IconIIcon v-if="icon" :icon="icon" />
    <span v-if="label && ($mq!=='mobile' || incontextmenu)" class="ml-1 label"> {{ label }} </span>
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
  @Prop({ default: 'color-primary-selected' }) classes!: string
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
