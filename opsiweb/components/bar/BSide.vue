<template>
  <b-sidebar
    id="sidemenu"
    :class="{sidemenu_small: !attributes.expanded}"
    bg-variant="secondary"
    text-variant="light"
    no-header
    :backdrop="$mq == 'mobile'"
    :no-close-on-route-change="$mq == 'desktop' ? true : false"
    :visible="attributes.visible"
  >
    <NavNSidebar :expanded="attributes.expanded" />
    <template v-if="$mq === 'desktop'" #footer="">
      <div class="sidemenu_footer">
        <b-button
          v-b-tooltip.hover
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

@Component
export default class BSide extends Vue {
  @Prop({ }) attributes!: object
}
</script>

<style>
#sidemenu {
  top: var(--height-navbar) !important;
  width: var(--width-sidebar-expanded);
  height: 100%;
}
.sidemenu_small > #sidemenu {
  width: var(--width-sidebar-collapsed);
}
.sidemenu_footer {
  display: inline;
  float: right;
  margin-bottom: 70px;
}
</style>
