<template>
  <div>
    <b-nav-item v-b-toggle="'collapse-navitem-'+title">
      <b-icon :icon="icon" /> {{ title }}
      <b-icon icon="caret-down-fill" class="caret_icon" font-scale="0.8" />
    </b-nav-item>
    <b-collapse :id="'collapse-navitem-'+title" accordion="sidebarAccordion">
      <b-nav vertical>
        <b-nav-item v-for="sub in submenu" :key="sub.title" :to="sub.route">
          <span class="submenu">
            {{ sub.title }}
          </span>
        </b-nav-item>
      </b-nav>
    </b-collapse>
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
      type: Array,
      default () {
        return []
      }
    }
  }
})
</script>

<style>
.submenu{
  margin-left: 35px;
}
.caret_icon{
  float: right;
  margin-top: 5px;
}
</style>
