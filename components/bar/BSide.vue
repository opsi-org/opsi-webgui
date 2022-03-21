<template>
  <b-sidebar
    id="sidemenu"
    data-testid="BarBSide"
    aria-label="sideMenu"
    no-header
    bg-variant="primary"
    text-variant="light"
    :class="{sidemenu_small: !attributes.expanded}"
    :backdrop="$mq == 'mobile'"
    :no-close-on-route-change="$mq == 'desktop' ? true : false"
    :visible="attributes.visible"
  >
    <NavNSidebar :expanded="attributes.expanded" />
    <template #footer>
      <DivDCountdowntimer :small="!attributes.expanded" />
      <b-button
        v-if="$mq === 'desktop'"
        v-b-tooltip.hover
        variant="primary"
        :title=" (attributes.expanded)? $t('button.collapse'): $t('button.expand')"
        :pressed.sync="attributes.expanded"
      >
        <span class="sr-only">{{ attributes.expanded? 'Collapse sidemenu': 'Expand sidemenu' }}</span>
        <b-icon v-if="attributes.expanded" :icon="iconnames.arrowDoubleLeft" />
        <b-icon v-else :icon="iconnames.arrowDoubleRight" />
      </b-button>
    </template>
  </b-sidebar>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ISidebarAttributes } from '../../.utils/types/tsettings'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class BSide extends Vue {
  $mq:any
  iconnames:any
  @Prop({ }) attributes!: ISidebarAttributes
}
</script>

<style>
#sidemenu {
  top: calc(var(--height-navbar) - 2px) !important;
  width: var(--width-sidebar-expanded);
  height: 100% !important;
  /* display: inline-flex !important; */
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
#sidemenu .b-sidebar-footer .btn {
  width: 100%;
  text-align: right;
  z-index: 100;
}
</style>
