<template>
  <div>
    Note: Dummy links
    <b-nav vertical tabs class="sidemenu_nav">
      <span v-for="catogery in navItems" :key="catogery.title">
        <NavNTitle :expanded="expanded" :title="catogery.title" />
        <span v-for="menuitem in catogery.menu" :key="menuitem.title">
          <template v-if="menuitem.submenu">
            <!-- @mouseover="onOverDropdown(menuitem.title)" @mouseleave="onLeaveDropdown(menuitem.title)" -->
            <div v-if="!expanded">
              <b-nav-item-dropdown :ref="'dropdown-' + menuitem.title" class="sidemenu_dropdown" block dropright no-caret>
                <template #button-content>
                  <b-icon :icon="menuitem.icon" />
                </template>
                <b-dropdown-item disabled>
                  {{ menuitem.title }}
                </b-dropdown-item>
                <b-dropdown-divider />
                <b-dropdown-item v-for="submenu in menuitem.submenu" :key="submenu.title" :to="submenu.route">
                  {{ submenu.title }}
                </b-dropdown-item>
              </b-nav-item-dropdown>
            </div>
            <div v-else>
              <NavNItemCollapse
                :expanded="expanded"
                :title="menuitem.title"
                :icon="menuitem.icon"
                :route="menuitem.route"
                :submenu="menuitem.submenu"
              />
            </div>
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
                { title: 'Configuration', route: '/support' },
                { title: 'Logs', route: '/support' }
              ]
            },
            {
              title: 'Clients',
              icon: 'laptop',
              submenu: [
                { title: 'Add New', route: '/support' },
                { title: 'Configuration', route: '/support' },
                { title: 'Logs', route: '/support' }
              ]
            },
            { title: 'Products', icon: 'grid-fill', route: '/' }
          ]
        },
        {
          title: 'Configure',
          menu: [
            { title: 'Settings', icon: 'gear-fill' },
            { title: 'Index page', icon: 'collection-fill', route: '/' }
          ]
        }
      ]
    }
  }
  // methods: {
  //   onOverDropdown (title: String) {
  //     (this.$refs['dropdown-' + title] as any).visible = true
  //     // (this.$refs.dropdown as any).visible = true
  //   },
  //   onLeaveDropdown (title: String) {
  //     (this.$refs['dropdown-' + title] as any).visible = false
  //     // (this.$refs.dropdown as any).visible = false
  //   }
  // }
})
</script>

<style>
.sidemenu_nav{
  position:absolute;
  width: 100%;
}
.sidemenu_dropdown .dropdown-menu{
  left: calc(var(--width-sidebar-collapsed) - 6px) !important;
}
</style>
