<template>
  <b-sidebar
    v-if="attributes.visible"
    id="sidemenu"
    data-testid="BarBSide"
    aria-label="sideMenu"
    no-header
    bg-variant="secondary"
    text-variant="light"
    :class="{sidemenu_small: !attributes.expanded}"
    :backdrop="$mq == 'mobile'"
    :no-close-on-route-change="$mq == 'desktop'"
    :visible="attributes.visible"
  >
    <NavNSidebar :expanded="attributes.expanded" />
    <template #footer>
      <DivDCountdowntimer :small="!attributes.expanded" />
      <b-button
        v-if="$mq === 'desktop'"
        v-b-tooltip.hover
        data-testid="BarBSideBtnExpand"
        :title=" (attributes.expanded)? $t('button.collapse'): $t('button.expand')"
        :pressed.sync="attributes.expanded"
      >
        <span class="sr-only">{{ attributes.expanded? $t('button.collapse'): $t('button.expand') }}</span>
        <b-icon v-if="attributes.expanded" :icon="iconnames.arrowDoubleLeft" />
        <b-icon v-else :icon="iconnames.arrowDoubleRight" />
      </b-button>
    </template>
  </b-sidebar>
</template>

<script lang="ts">
import Cookie from 'js-cookie'
import { Component, Prop, Watch, Vue } from 'nuxt-property-decorator'
import { ISidebarAttributes } from '../../.utils/types/tsettings'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class BSide extends Vue {
  $mq:any
  iconnames:any
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
.sidemenu_small > #sidemenu {
  width: var(--width-sidebar-collapsed);
}
#sidemenu .b-sidebar-footer {
  border-top: 1px solid var(--light) !important;
  background-color: var(--secondary);
  z-index: 100;
  height: auto;
  display: inline;
  float: right;
  margin-right: 2px;
  margin-bottom: 0px;
}
#sidemenu .b-sidebar-footer .btn {
  width: 100%;
  text-align: right;
  z-index: 100;
}
</style>
