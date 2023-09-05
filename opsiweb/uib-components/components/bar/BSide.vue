<template>
  <b-sidebar
    v-if="attributes.visible"
    id="sidemenu"
    data-testid="BarBSide"
    :aria-label="$t('labelaria,sidemenu')"
    no-header
    bg-variant="primary"
    text-variant="light"
    :class="{sidemenu_small: !attributes.expanded}"
    :backdrop="$mq == 'mobile'"
    :no-close-on-route-change="$mq == 'desktop'"
    :visible="attributes.visible"
    @hidden="$emit('update:sidebarshown', false)"
  >
    <NavNSidebar :expanded="attributes.expanded" />
    <template #footer>
      <DivDCountdowntimer :small="!attributes.expanded" />
      <span v-once class="ml-1 text-small topbar_version"> v{{ $config.packageVersion }} </span>
      <b-button
        v-if="$mq === 'desktop'"
        variant="primary"
        size="sm"
        class="border-0 float-right"
        data-testid="BarBSideBtnExpand"
        :title=" (attributes.expanded)? $t('button.collapse'): $t('button.expand')"
        :pressed.sync="attributes.expanded"
      >
        <span class="sr-only">{{ attributes.expanded? $t('button.collapse'): $t('button.expand') }}</span>
        <b-icon :icon="attributes.expanded ? icon.arrowDoubleLeft : icon.arrowDoubleRight" />
      </b-button>
    </template>
  </b-sidebar>
</template>

<script lang="ts">
import Cookie from 'js-cookie'
import { Component, Prop, Watch, Vue } from 'nuxt-property-decorator'
import { ISidebarAttributes } from '../../.utils/types/tsettings'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons] })
export default class BSide extends Vue {
  $config:any
  $mq:any
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
      Cookie.set('menu_attributes_desktop', JSON.stringify(this.attributes), { expires: 365 })
    }
  }

  updateAttributes () {
    if ((this as any).$mq === 'mobile') {
      this.attributes.visible = this.alwaysVisible
      this.attributes.expanded = true
    } else {
      if (!this.alwaysVisible && Cookie.get('menu_attributes_desktop')) {
        this.attributes.expanded = JSON.parse(Cookie.get('menu_attributes_desktop') as unknown as any).expanded
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
  z-index: 100;
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
