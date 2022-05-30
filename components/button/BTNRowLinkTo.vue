<template>
  <b-button
    :variant="variant"
    data-testid="ButtonBTNRowLinkTo"
    :class="{ ...classes, 'w-100 h-100 text-left': true}"
    :title="title"
    size="sm"
    :pressed="pressed(to, ident, sortby)"
    :aria-label="title"
    @click="action"
  >
    <!-- v-bind="$props" -->
    <!-- title="config"
    @click="routeRedirectWith('/depots/config', row.item.ident)" -->
    <b-icon v-if="icon" :icon="icon" />
    <!-- {{ ($mq=='mobile' && title)? title: '' }} -->
    <template v-if="label && $mq!=='mobile'">
      {{ label }}
    </template>
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
// import { BButton } from 'bootstrap-vue' // extending from this, causes _vm not defined

@Component
export default class BTNRowLinkTo extends Vue {
  @Prop({ }) pressed!: Function
  @Prop({ }) click!: Function|undefined
  @Prop({ }) clickParent!: Function
  @Prop({ }) to!: string
  @Prop({ }) sortby!: string
  @Prop({ }) ident!: string
  @Prop({ }) label?: string
  @Prop({ default: 'title' }) title!: string
  @Prop({ default: '' }) icon!: string
  @Prop({ default: 'outline-primary' }) variant!: string
  @Prop({ default: 'border-0' }) classes!: string

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
</style>
