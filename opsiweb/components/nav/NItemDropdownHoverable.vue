<template>
  <div @mouseover="onMouseOver" @mouseleave="onMouseLeave">
    <b-nav-item-dropdown ref="dropdown" class="sidemenu_dropdown" block dropright no-caret>
      <template #button-content>
        <b-icon :icon="icon" />
      </template>
      <b-dropdown-item disabled>
        {{ title }}
      </b-dropdown-item>
      <b-dropdown-divider />
      <b-dropdown-item v-for="sub in submenu" :key="sub.title" :to="sub.route">
        {{ sub.title }}
      </b-dropdown-item>
    </b-nav-item-dropdown>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    title: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    route: {
      type: String,
      default: ''
    },
    submenu: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  methods: {
    onMouseOver () {
      (this.$refs.dropdown as any).visible = true
    },
    onMouseLeave () {
      (this.$refs.dropdown as any).visible = false
    }
  }
})
</script>

<style>
.sidemenu_dropdown .dropdown-menu{
  left: calc(var(--width-sidebar-collapsed) - 6px) !important;
}
</style>
