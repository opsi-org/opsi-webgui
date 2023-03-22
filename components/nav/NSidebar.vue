<template>
  <b-nav vertical tabs class="sidemenu_nav" :class="{expanded:expanded}" data-testid="NSidebar">
    <span v-for="catogery in navItems" :key="catogery.title">
      <br>
      <!-- <small v-if="expanded" class="container"> <small>{{ $t(catogery.title) }} </small> </small> -->
      <span v-for="menuitem in catogery.menu" :key="menuitem.title">
        <template v-if="menuitem.submenu">
          <NavItemNICollapsible
            v-if="expanded"
            :title="menuitem.title"
            :disabled="menuitem.disabled"
            :icon="menuitem.icon"
            :route="menuitem.route"
            :submenu="menuitem.submenu"
          />
          <NavItemNIDropdownHoverable
            v-else
            :data-testid="'NSidebar-'+menuitem.title"
            :title="menuitem.title"
            :disabled="menuitem.disabled"
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
            :disabled="menuitem.disabled"
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
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { IObjectString2Boolean } from '../../.utils/types/tgeneral'
import { Constants } from '../../mixins/uib-mixins'
const config = namespace('config-app')

interface IMenuItem {
  title:string
  route?: string
  icon?: string
  disabled?: boolean
  submenu?: Array<IMenuItem>
  menu?: Array<IMenuItem>
}

@Component({ mixins: [Constants] })
export default class NSidebar extends Vue {
  $route: any
  $nuxt: any
  iconnames: any // from mixin
  @Prop({ }) expanded!: boolean
  @config.Getter public config!: IObjectString2Boolean

  get navItems (): Array<IMenuItem> {
    return [
      {
        title: 'title.overview',
        menu: [
          { title: 'title.healthcheck', icon: 'heart', route: '/serverhealthcheck' }
          // { title: 'Dashboard', icon: 'bar-chart-line-fill', route: '/dashboard' },
        ]
      },
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
              { title: 'title.addNew', route: '/clientscreation', disabled: (this.config) ? !this.config?.client_creation : false },
              { title: 'title.config', route: '/clientsconfig' },
              { title: 'title.log', route: '/clientslog' }
            ]
          },
          { title: 'title.products', icon: this.iconnames.product, route: '/products/' },
          { title: 'title.groups', icon: this.iconnames.group, route: '/groups/' }
        ]
      },
      {
        title: 'title.configure',
        menu: [
          {
            title: 'title.admin',
            route: '/admin/terminal/',
            icon: this.iconnames.admin,
            submenu: [
              { title: 'title.adminterminal', route: '/admin/terminal' }
              // { title: 'title.addNew', route: '/clientscreation', disabled: (this.config) ? !this.config?.client_creation : false },
              // { title: 'title.config', route: '/clientsconfig' },
              // { title: 'title.log', route: '/clientslog' }
            ]
          },
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
.sidemenu_nav a.nuxt-link-active,
.sidemenu_nav a.nuxt-link-exact-active,
.sidemenu_nav .checkactive.nav-item {
  color:var(--color);
  background-color: var(--primary-dark);
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
.sidemenu_nav.nav-tabs .nav-item:focus,
.sidemenu_nav.nav-tabs .nav-item:hover {
  background-color: var(--primary-dark);
  color: var(--color);
}
</style>
