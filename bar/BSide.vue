<template>
  <div>
    <b-sidebar
      id="sidemenu"
      :class="{sidemenu_small: !attributes.currentlyOpen}"
      bg-variant="secondary"
      text-variant="light"
      no-header
      :no-close-on-route-change="$mq == 'desktop' ? true : false"
      :visible="attributes.visible"
    >
      <!-- @hidden="attributes.visible =! attributes.visible" -->
      <b-nav vertical tabs>
        <b-nav-item active>
          Depots
        </b-nav-item>
        <b-nav-item>Clients</b-nav-item>
        <b-nav-item>Products</b-nav-item>
      </b-nav>
      <template v-if="$mq === 'desktop'" #footer="">
        <div class="sidemenu_footer">
          <b-button
            v-b-tooltip.hover
            :title=" (!attributes.currentlyOpen)? 'Expand': 'Collapse'"
            @click="toggleSidebar(!attributes.currentlyOpen)"
          >
            <b-icon v-if="!attributes.currentlyOpen" icon="chevron-double-right" variant="light" />
            <b-icon v-else-if="attributes.currentlyOpen" icon="chevron-double-left" variant="light" />
          </b-button>
        </div>
      </template>
    </b-sidebar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data () {
    return {
      attributes: { visible: true, currentlyOpen: false }
    }
  },
  methods: {
    toggleSidebar (opened: boolean) {
      this.attributes.currentlyOpen = opened
    }
  }
})
</script>

<style>
#sidemenu {
  top: 56px !important;
  width: 200px;
  /* margin-bottom: 70px; */
}
.sidemenu_small > #sidemenu {
  width: 40px;
}
.sidemenu_footer {
  display: inline;
  float: right;
  margin-bottom: 70px;
}
</style>
