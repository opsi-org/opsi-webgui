<template>
  <b-sidebar
    v-if="attributes.visible"
    id="sidemenu"
    data-testid="BarBSide"
    :aria-label="$t('labelaria.sidemenu')"
    no-header
    bg-variant="primary"
    text-variant="light"
    :class="{sidemenu_small: !attributes.expanded}"
    :backdrop="$mq == 'mobile'"
    :no-close-on-route-change="$mq !== 'mobile'"
    :visible="attributes.visible"
    @hidden="$emit('update:sidebarshown', false)"
  >
    <NavNSidebar :expanded="attributes.expanded" />
    <template #footer>
      <DivDCountdowntimer :small="!attributes.expanded" />
      <!-- <span v-once class="ml-1 text-small topbar_version"> {{ $t('versionmarker') }}{{ $config.packageVersion }} </span> -->
      <b-button
        v-if="$mq !== 'mobile'"
        variant="primary"
        size="sm"
        class="border-0 float-right"
        data-testid="BarBSideBtnExpand"
        :title=" (attributes.expanded)? $t('button.collapse'): $t('button.expand')"
        :pressed.sync="attributes.expanded"
      >
        <span class="sr-only">{{ attributes.expanded? $t('button.collapse'): $t('button.expand') }}</span>
        <IconIIcon :icon="attributes.expanded ? icon.arrowDoubleLeft : icon.arrowDoubleRight" />
      </b-button>
    </template>
  </b-sidebar>
</template>

<script lang="ts">
import Cookie from 'js-cookie'
import { Component, Prop, Watch, Vue } from 'nuxt-property-decorator'
import { ISidebarAttributes } from '../../.utils/types/tsettings'
import { Cookies } from '../../mixins/cookies'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons, Cookies] })
export default class BSide extends Vue {
  $config:any
  $mq!:any
  getKeyCookie: any
  setCookie: any
  existsCookie: any
  icon:any
  @Prop({ }) attributes!: ISidebarAttributes
  @Prop({ default: false }) alwaysVisible!: boolean

  mounted () {
    this.updateAttributes()
  }

  @Watch('$mq', { deep: true }) mqChanged () {
    this.updateAttributes()
  }

  @Watch('attributes', { deep: true }) attributesChanged () {
    if (this.$mq !== 'mobile' && !this.alwaysVisible) {
      this.setCookie('menu_attributes_desktop', JSON.stringify(this.attributes), { expires: 365 })
    }
  }

  updateAttributes () {
    if (this.$mq === 'mobile') {
      this.attributes.visible = this.alwaysVisible
      this.attributes.expanded = true
    } else {
      if (!this.alwaysVisible && this.existsCookie('menu_attributes_desktop')) {
        this.attributes.expanded = this.getKeyCookie('menu_attributes_desktop', 'expanded', true)
      }
      this.attributes.visible = true
    }
  }
}
</script>

<style>
#sidemenu {
  top: calc(var(--height-navbar) - 2px) !important;
  width: var(--width-sidebar-expanded);
  height: 100% !important;
}
.mobile #sidemenu {
  top: calc(var(--height-navbar) - 0px) !important;
  width: 70%;
  height: 100% !important;
}
.sidemenu_small > #sidemenu {
  width: var(--width-sidebar-collapsed);
}
#sidemenu .b-sidebar-footer {
  border-top: 1px solid var(--light) !important;
  background-color: var(--primary);
  z-index: 1;
  height: auto;
  display: inline;
  float: right;
  margin-right: 2px;
  margin-bottom: 0px;
}
.sidebar_content .b-sidebar-backdrop{
  width: 100% !important;
  height: 100% !important;
}
</style>
