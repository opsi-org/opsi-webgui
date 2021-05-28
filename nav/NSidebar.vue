<template>
  <div>
    <span style="color:blue">Note: Edit navItems route in components/nav/NSidebar</span>
    <b-nav vertical tabs class="sidemenu_nav">
      <span v-for="catogery in navItems" :key="catogery.title">
        <NavNTitle :expanded="expanded" :title="catogery.title" />
        <span v-for="menuitem in catogery.menu" :key="menuitem.title">
          <template v-if="menuitem.submenu">
            <NavNItemCollapsible
              v-if="expanded"
              :title="menuitem.title"
              :icon="menuitem.icon"
              :route="menuitem.route"
              :submenu="menuitem.submenu"
            />
            <NavNItemDropdownHoverable
              v-else
              :title="menuitem.title"
              :icon="menuitem.icon"
              :route="menuitem.route"
              :submenu="menuitem.submenu"
            />
          </template>
          <template v-else>
            <NavNItem :expanded="expanded" :title="menuitem.title" :icon="menuitem.icon" :route="menuitem.route" />
          </template>
        </span>
      </span>
    </b-nav>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    expanded: Boolean
  },
  data () {
    return {
      navItems: [
        {
          title: 'Test',
          menu: [
            { title: 'Two-column-layout', icon: 'layout-split', route: '/testtwocolumn' },
            {
              title: 'With-Child',
              icon: 'layout-split',
              submenu: [
                { title: 'withchild-All', route: '/testtwocolumn' },
                { title: 'Child1', route: '/testtwocolumnchild1' }
              ]
            }
          ]
        },
        {
          title: 'Overview',
          menu: [
            { title: 'Dashboard', icon: 'bar-chart-line-fill', route: '/dashboard' },
            { title: 'Support', icon: 'headset', route: '/support' }
          ]
        },
        {
          title: 'Manage',
          menu: [
            {
              title: 'Depots',
              icon: 'hdd-stack-fill',
              submenu: [
                { title: 'All Depots', route: '/' },
                { title: 'Configuration', route: '/' },
                { title: 'Logs', route: '/' }
              ]
            },
            {
              title: 'Clients',
              icon: 'laptop',
              submenu: [
                { title: 'All Clients', route: '/' },
                { title: 'Add New', route: '/' },
                { title: 'Configuration', route: '/' },
                { title: 'Logs', route: '/' }
              ]
            },
            { title: 'Products', icon: 'grid-fill', route: '/' }
          ]
        },
        {
          title: 'Configure',
          menu: [
            { title: 'Settings', icon: 'gear-fill', route: '/' },
            { title: 'Index page', icon: 'collection-fill', route: '/' }
          ]
        }
      ]
    }
  }
})
</script>

<style>
.sidemenu_nav{
  position:absolute;
  width: 100%;
}
</style>
