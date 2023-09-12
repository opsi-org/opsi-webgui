<template>
  <b-navbar
    data-testid="BarBTop"
    class="topbar"
    fixed="top"
    type="dark"
  >
    <b-navbar-nav v-if="$mq === 'mobile'" small>
      <slot name="mobilemenu" />
    </b-navbar-nav>
    <b-navbar-brand class="d-inline-flex " href="/addons/webgui/app/clients/">
      <IconIOpsiLogo
        v-once
        short
        light
        white
        height="40"
        :classes="classes"
      />
      <IconIReadOnly />
    </b-navbar-brand>
    <BarBBreadcrumbRow v-if="$mq == 'desktop'" class="ml-2" />
    <b-navbar-nav small :class="$mq == 'desktop' ? 'ml-auto' : ''">
      <ModalMTrackChanges class="mr-1" />
      <slot name="quickpanel" />
    </b-navbar-nav>
  </b-navbar>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons] })
export default class BTop extends Vue {
  $nuxt: any
  $mq:any
  $t:any
  $config:any
  icon:any

  get classes () { return this.$mq !== 'desktop' ? 'pb-1' : 'mt-1 ml-0 pb-1' }

  get username () {
    return localStorage.getItem('username')
  }
}
</script>

<style>
.topbar{
  background: var(--primary) !important;
  height: var(--height-navbar) !important;
  margin-bottom: 0px !important;
  padding: 0em !important;
  padding-left: 5px !important;
  padding-right: 0px !important;
}
.mobile .topbar {
  padding-left: 0px !important;
}
.mobile .topbar .navbar-brand{
  margin: auto;
}
.topbar_brand{
  max-height: var(--height-navbar) !important;
  display: inline-flex !important;
  padding-bottom: 0px !important;
}
.topbar_title{
  font-size: 15px;
  margin-top: 7px;
}
</style>
