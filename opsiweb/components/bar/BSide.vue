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
      <b-nav vertical tabs class="sidemenu_nav">
        <b-nav-text v-if="attributes.currentlyOpen">
          Overview
        </b-nav-text>
        <b-nav-text v-else />
        <b-nav-item>
          <b-icon icon="bar-chart-line-fill" />
          <span v-if="attributes.currentlyOpen">
            Dashboard Dummy
          </span>
        </b-nav-item>
        <b-nav-item>
          <b-icon icon="headset" />
          <span v-if="attributes.currentlyOpen">
            Support Dummy
          </span>
        </b-nav-item>
        <b-nav-text v-if="attributes.currentlyOpen">
          Manage
        </b-nav-text>
        <b-nav-text v-else />
        <div @mouseover="onOverMenuDrop" @mouseleave="onLeaveMenuDrop">
          <b-nav-item-dropdown ref="dropdown" block dropright no-caret>
            <template #button-content>
              <b-icon icon="hdd-stack-fill" />
              <span v-if="attributes.currentlyOpen">
                Depots Dummy 1
              </span>
            </template>
            <b-dropdown-item v-if="!attributes.currentlyOpen">
              Depots Dummy 1
            </b-dropdown-item>
            <b-dropdown-divider v-if="!attributes.currentlyOpen" />
            <b-dropdown-item>First Action</b-dropdown-item>
            <b-dropdown-item>Second Action</b-dropdown-item>
            <b-dropdown-item>Third Action</b-dropdown-item>
          </b-nav-item-dropdown>
        </div>
        <b-nav-text v-if="attributes.currentlyOpen">
          Configure
        </b-nav-text>
        <b-nav-text v-else />
        <b-nav-item>
          <b-icon icon="gear-fill" />
          <span v-if="attributes.currentlyOpen">
            Setting Dummy
          </span>
        </b-nav-item>
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
    },
    onOverMenuDrop () {
      (this.$refs.dropdown as any).visible = true
    },
    onLeaveMenuDrop () {
      (this.$refs.dropdown as any).visible = false
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
  width: 50px;
}
.sidemenu_footer {
  display: inline;
  float: right;
  margin-bottom: 70px;
}
.sidemenu_nav{
  position:absolute;
  float:right;
}
</style>
