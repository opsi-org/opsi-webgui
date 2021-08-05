<template>
  <div>
    <!-- TODO: Edit navItems route in components/nav/NSidebar -->
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
        <br>
      </span>
    </b-nav>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class NSidebar extends Vue {
  @Prop({ }) expanded!: boolean
  navItems : Array<object> = [
    {
      title: 'title.overview',
      menu: [
        // { title: 'Dashboard', icon: 'bar-chart-line-fill', route: '/dashboard' },
        { title: 'title.support', icon: 'headset', route: '/support' }
      ]
    },
    {
      title: 'title.manage',
      menu: [
        {
          title: 'title.depots',
          route: '/depots/',
          icon: 'hdd-stack-fill',
          submenu: [
            { title: 'title.allDepots', route: '/depots' },
            { title: 'title.config', route: '/depotsconfig' }
            // { title: 'Logs', route: '/depots/log' }
          ]
        },
        {
          title: 'title.clients',
          route: '/clients/',
          icon: 'laptop',
          submenu: [
            { title: 'title.allClients', route: '/clients/' },
            { title: 'title.addNew', route: '/clientsaddnew' },
            { title: 'title.config', route: '/clientsconfig' },
            { title: 'title.log', route: '/clientslog' }
          ]
        },
        { title: 'title.products', icon: 'grid-fill', route: '/products/' }
      ]
    },
    {
      title: 'title.configure',
      menu: [
        { title: 'title.settings', icon: 'gear-fill', route: '/settings' }
        // { title: 'Index page', icon: 'collection-fill', route: '/' }
      ]
    }
  ]
}
</script>

<style>
.navbar-light .navbar-nav .nav .nav-item{
  color: unset !important;
  font-weight: normal !important;
  padding-top: 0px;
  padding-bottom: 0px;
}

.sidemenu_nav{
  position:absolute;
  width: 100%;
}
</style>
