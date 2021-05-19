<template>
  <div>
    <b-nav vertical tabs class="sidemenu_nav">
      <NavNTitle :expanded="expanded" :title="'Overview'" />
      <NavNItem :expanded="expanded" :title="'Dashboard Dummy'" :icon="'bar-chart-line-fill'" />
      <NavNItem :expanded="expanded" :title="'Support Dummy'" :icon="'headset'" />

      <NavNTitle :expanded="expanded" :title="'Manage'" />
      <div v-if="!expanded" @mouseover="onOverMenuDrop" @mouseleave="onLeaveMenuDrop">
        <b-nav-item-dropdown ref="dropdown" block dropright no-caret>
          <template #button-content>
            <b-icon icon="hdd-stack-fill" />
          </template>
          <b-dropdown-item disabled>
            Depots Dummy
          </b-dropdown-item>
          <b-dropdown-divider />
          <b-dropdown-item>All Depots</b-dropdown-item>
          <b-dropdown-item>Configuration</b-dropdown-item>
          <b-dropdown-item>Logs</b-dropdown-item>
        </b-nav-item-dropdown>
      </div>
      <!-- <NavNItem v-else v-b-toggle.collapse-navitem :expanded="expanded" :title="'Depots Dummy'" :icon="'hdd-stack-fill'" /> -->
      <b-nav-item v-else v-b-toggle.collapse-navitem>
        <b-icon icon="hdd-stack-fill" /> Depots Dummy
      </b-nav-item>
      <b-collapse v-if="expanded" id="collapse-navitem">
        <b-nav vertical>
          <b-nav-item>
            <span class="submenu">
              All Depots
            </span>
          </b-nav-item>
          <b-nav-item>
            <span class="submenu">
              Configuration
            </span>
          </b-nav-item>
          <b-nav-item>
            <span class="submenu">
              Logs
            </span>
          </b-nav-item>
        </b-nav>
      </b-collapse>
      <div v-if="!expanded" @mouseover="onOverMenuDrop1" @mouseleave="onLeaveMenuDrop1">
        <b-nav-item-dropdown ref="dropdown1" block dropright no-caret>
          <template #button-content>
            <b-icon icon="laptop" />
          </template>
          <b-dropdown-item disabled>
            Clients Dummy
          </b-dropdown-item>
          <b-dropdown-divider />
          <b-dropdown-item>All Clients</b-dropdown-item>
          <b-dropdown-item>Add New</b-dropdown-item>
          <b-dropdown-item>Configuration</b-dropdown-item>
          <b-dropdown-item>Logs</b-dropdown-item>
        </b-nav-item-dropdown>
      </div>
      <b-nav-item v-else v-b-toggle.collapse-navitem1>
        <b-icon icon="laptop" /> Clients Dummy
      </b-nav-item>
      <b-collapse v-if="expanded" id="collapse-navitem1">
        <b-nav vertical>
          <b-nav-item>
            <span class="submenu">
              All Clients
            </span>
          </b-nav-item>
          <b-nav-item>
            <span class="submenu">
              Add New
            </span>
          </b-nav-item>
          <b-nav-item>
            <span class="submenu">
              Configuration
            </span>
          </b-nav-item>
          <b-nav-item>
            <span class="submenu">
              Logs
            </span>
          </b-nav-item>
        </b-nav>
      </b-collapse>
      <NavNItem :expanded="expanded" :title="'Products Dummy'" :icon="'grid-fill'" />

      <NavNTitle :expanded="expanded" :title="'Configure'" />
      <NavNItem :expanded="expanded" :title="'Settings Dummy'" :icon="'gear-fill'" />
    </b-nav>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    expanded: Boolean
  },
  methods: {
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
.sidemenu_nav{
  position:absolute;
  float:right;
}
.submenu{
  margin-left: 35px;
}
</style>
