<template>
  <b-sidebar
    id="sidemenu"
    data-testid="BarBSide"
    no-header
    bg-variant="primary"
    text-variant="light"
    :class="{sidemenu_small: !attributes.expanded}"
    :backdrop="$mq == 'mobile'"
    :no-close-on-route-change="$mq == 'desktop' ? true : false"
    :visible="attributes.visible"
  >
    <DivDCountdowntimer v-if="$mq === 'mobile'" />
    <NavNSidebar :expanded="attributes.expanded" />
    <template v-if="$mq === 'desktop'" #footer="">
      <DivDCountdowntimer />
      <div class="sidemenu_footer">
        <b-button
          v-b-tooltip.hover
          variant="primary"
          :title=" (attributes.expanded)? $t('button.collapse'): $t('button.expand')"
          :pressed.sync="attributes.expanded"
        >
          <b-icon v-if="attributes.expanded" icon="chevron-double-left" />
          <b-icon v-else icon="chevron-double-right" />
        </b-button>
      </div>
    </template>
  </b-sidebar>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ISidebarAttributes } from '~/scripts/types/tsettings'

@Component
export default class BSide extends Vue {
  @Prop({ }) attributes!: ISidebarAttributes
}
</script>

<style>
#sidemenu {
  top: calc(var(--height-navbar) - 3px) !important;
  width: var(--width-sidebar-expanded);
  height: 100%;
}
.sidemenu_small > #sidemenu {
  width: var(--width-sidebar-collapsed);
}
.sidemenu_footer .btn {
  padding: 10px;
  border: 1px solid var(--light) !important;
  z-index: 2200;
}
.sidemenu_footer {
  display: inline;
  float: right;
  margin-right: 2px;
  margin-bottom: 70px;
}
</style>
