<template>
  <b-nav vertical tabs class="sidemenu_nav" data-testid="NSidebar">
    <span v-for="catogery in navItems" :key="catogery.title">
      <br>
      <NavItemNITitle :expanded="expanded" :title="catogery.title" />
      <span v-for="menuitem in catogery.menu" :key="menuitem.title">
        <template v-if="menuitem.submenu">
          <NavItemNICollapsible
            v-if="expanded"
            :data-testid="'NSidebar-'+menuitem.title"
            :title="menuitem.title"
            :icon="menuitem.icon"
            :route="menuitem.route"
            :submenu="menuitem.submenu"
          />
          <NavItemNIDropdownHoverable
            v-else
            :data-testid="'NSidebar-'+menuitem.title"
            :title="menuitem.title"
            :icon="menuitem.icon"
            :route="menuitem.route"
            :submenu="menuitem.submenu"
          />
        </template>
        <template v-else>
          <NavItemNIItem
            :class="{checkactive: $route.path.includes(menuitem.route)}"
            :expanded="expanded"
            :title="menuitem.title"
            :icon="menuitem.icon"
            :route="menuitem.route"
          />
        </template>
      </span>
      <br>
    </span>
  </b-nav>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

interface IMenuItem {
  title:string
  route?: string
  icon?: string
  submenu?: Array<IMenuItem>
  menu?: Array<IMenuItem>
}

@Component({ mixins: [Constants] })
export default class NSidebar extends Vue {
  $nuxt: any
  iconnames: any // from mixin
  @Prop({ }) expanded!: boolean

  created () {
    console.log('constants: ', this.iconnames)
  }

  refresh (route) {
    if (this.$route.path.includes(route)) {
      this.$nuxt.refresh()
    }
  }

  get navItems (): Array<IMenuItem> {
    return [
      // {
      //   title: 'title.overview',
      //   menu: [
      //     // { title: 'Dashboard', icon: 'bar-chart-line-fill', route: '/dashboard' },
      //   ]
      // },
      {
        title: 'title.manage',
        menu: [
          {
            title: 'title.depots',
            route: '/depots/',
            icon: this.iconnames.depot,
            submenu: [
              { title: 'title.allDepots', route: '/depots/' },
              { title: 'title.config', route: '/depotsconfig' }
            ]
          },
          {
            title: 'title.clients',
            route: '/clients/',
            icon: this.iconnames.client,
            submenu: [
              { title: 'title.allClients', route: '/clients/' },
              { title: 'title.addNew', route: '/clientsaddnew' },
              { title: 'title.config', route: '/clientsconfig' },
              { title: 'title.log', route: '/clientslog' }
            ]
          },
          { title: 'title.products', icon: this.iconnames.product, route: '/products/' }
        ]
      },
      {
        title: 'title.configure',
        menu: [
          { title: 'title.support', icon: this.iconnames.support, route: '/support' },
          { title: 'title.settings', icon: this.iconnames.settings, route: '/settings' }
          // { title: 'Index page', icon: 'collection-fill', route: '/' }
        ]
      }
    ]
  }
}
</script>

<style>
a.nuxt-link-active {
  font-weight:bolder;
}
/* exact link will show the primary color for only the exact matching link */
a.nuxt-link-exact-active {
  font-weight:bolder;
}
.checkactive.nav-item {
  font-weight:bolder;
  background-color: grey;
}
.navbar-light .navbar-nav .nav .nav-item{
  color: inherit !important;
  font-weight: normal !important;
  padding-top: 0px;
  padding-bottom: 0px;
}
#sidemenu .b-sidebar-body {
  width: inherit;
  max-height: calc(100% - var(--height-navbar) - 80px);
}
.sidemenu_nav{
  position: absolute;
  flex-wrap: nowrap !important;
  width: 100%;
  height: 100%;
  overflow-x: visible;
}

.sidebar_collapsed .sidemenu_nav .nav-item{
  margin-right: 0px !important;
}
.sidebar_collapsed .sidemenu_nav .nav-link > svg{
  margin: 0 auto !important;
}
.timer {
  margin: auto;
}
</style>
