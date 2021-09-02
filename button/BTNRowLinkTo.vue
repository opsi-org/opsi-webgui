<template>
  <b-button
    variant="outline-primary"
    class="Btn_Row_action"
    :title="title"
    size="sm"
    :pressed="pressed(to, ident)"
    @click="click(to, ident)"
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
  @Prop({ }) click!: Function
  @Prop({ }) to!: string
  @Prop({ }) ident!: string
  @Prop({ }) title!: string
  @Prop({ }) icon!: string
}
</script>

<style>
.Btn_Row_action {

}
</style>
