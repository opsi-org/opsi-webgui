<template>
  <div>
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
      <NavNSideBarNav :expanded="attributes.expanded" />
      <template v-if="$mq === 'desktop'" #footer="">
        <div class="sidemenu_footer">
          <b-button
            v-b-tooltip.hover
            :title=" (!attributes.expanded)? 'Expand': 'Collapse'"
            :pressed.sync="attributes.expanded"
          >
            <b-icon v-if="!attributes.expanded" icon="chevron-double-right" />
            <b-icon v-else-if="attributes.expanded" icon="chevron-double-left" />
          </b-button>
        </div>
      </template>
    </b-sidebar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    attributes: {
      type: Object,
      default () {
        return { visible: true, expanded: false }
      }
    }
  }
})
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
