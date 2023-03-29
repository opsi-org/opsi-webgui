<template>
  <b-button
    :variant="variant"
    data-testid="ButtonBTNRowLinkTo"
    :class="{'w-100 h-100 text-left d-flex ': true, 'dropdown-item': incontextmenu, [classes]: true}"
    :title="label ? '' : title"
    size="sm"
    :pressed="pressed(to, ident, sortby)"
    :aria-label="title"
    @click="action"
  >
    <b-icon v-if="icon" :icon="icon" />
    <template v-if="label && ($mq!=='mobile' || incontextmenu)">
      <small class="label pl-1" style="font-size: 85%;">{{ label }}</small>
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
  @Prop({ default: 'border-0 color-primary-selected' }) classes!: string
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
<style>
.col-rowactions > .btn-group .btn {
  color: var(--general-fg);
}
tbody tr:hover .col-rowactions > .btn-group .btn,
.row-selected .color-primary-selected,
.row-selected .color-primary-selected:hover {
  color: var(--primary-foreground) !important;
}
</style>
