<template>
  <b-navbar class="pageheader_navbar" data-testid="BarBPageHeader" :variant="variant">
    <span v-if="navbartype == 'collapse'">
      <b-icon v-if="collapsed" :icon="iconnames.arrowDoubleDown" />
      <b-icon v-else :icon="iconnames.arrowDoubleRight" />
    </span>
    <b v-if="title && bold">{{ title }}</b>
    <p v-else-if="title && !bold">
      {{ title }}
    </p>
    <span v-if="subtitle" class="font-italic ml-1">
      {{ subtitle }}
    </span>
    <slot name="left" />
    <b-navbar-nav class="ml-auto">
      <slot name="right" />
      <b-button v-if="closeroute" class="border-0" variant="outline-primary" :to="closeroute">
        <span class="sr-only">{{ $t('button.close') }}</span>
        <b-icon :icon="iconnames.x" />
      </b-button>
    </b-navbar-nav>
  </b-navbar>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class BPageHeader extends Vue {
  iconnames:any
  @Prop({ default: 'transparent' }) variant!: string;
  @Prop({ default: true }) bold!: boolean;
  @Prop({}) navbartype!: string;
  @Prop({}) collapsed!: boolean;
  @Prop({}) title!: string;
  @Prop({}) subtitle!: string;
  @Prop({}) closeroute!: string;
}
</script>

<style>
.pageheader_navbar.navbar-expand {
  flex-flow: row wrap;
}
.pageheader_navbar {
  padding: 5px 0px !important;
  margin-bottom: 10px;
}
</style>
