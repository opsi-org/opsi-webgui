<template>
  <b-button
    variant="outline-primary"
    class="Btn_Row_action"
    :title="title"
    size="sm"
    :pressed="pressed(to, ident)"
    @click="action"
  >
    <!-- v-bind="$props" -->
    <!-- title="config"
    @click="routeRedirectWith('/depots/config', row.item.ident)" -->
    <b-icon :icon="icon" />
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
  @Prop({ }) ident!: string
  @Prop({ }) title!: string
  @Prop({ }) icon!: string

  action () {
    console.debug('action triggered', this.click, this.clickParent)
    if (this.click !== undefined) {
      console.debug('click is defined')
      this.click(this.to, this.ident)
    } else if (this.clickParent !== undefined) {
      console.debug('emit', this.clickParent)
      this.clickParent(this.to, this.ident)
    } else {
      console.error('no action defined')
    }
  }
}
</script>

<style>
.Btn_Row_action {

}
</style>
