<template>
  <b-navbar
    :class="{pageheader: $mq === 'desktop', pageheader_wrap: $mq === 'mobile'}"
    class="BPageHeader_Navbar"
    variant="transparent"
  >
    <span v-if="navbartype=='collapse'">
      <b-icon v-if="collapsed" icon="chevron-double-down" />
      <b-icon v-else icon="chevron-double-right" />
    </span>
    <b v-if="title">{{ title }}</b>
    <slot name="left" />
    <b-navbar-nav class="ml-auto">
      <slot name="right" />
      <b-button v-if="closeroute" :to="closeroute">
        <b-icon icon="x" />
      </b-button>
    </b-navbar-nav>
  </b-navbar>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class BPageHeader extends Vue {
  @Prop({ }) navbartype!: string
  @Prop({ }) collapsed!: boolean
  @Prop({ }) title!: string
  @Prop({ }) closeroute!: string
}
</script>

<style>
.pageheader{
  height: var(--height-navbar) !important;
}
.pageheader_wrap {
  display: flex;
  flex-wrap: wrap;
}
.navbar {
  z-index: inherit !important;
  padding-left: 0rem !important;
  padding-right: 0rem !important;
}
.BPageHeader_Navbar{
  background-image: none !important;
  padding: 5px 0px !important;
}
.BPageHeader_Navbar .dropdown{
  margin: 0px !important;
}
</style>
