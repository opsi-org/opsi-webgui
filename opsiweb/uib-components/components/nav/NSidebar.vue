<template>
  <b-nav vertical tabs class="sidemenu_nav" :class="{expanded:expanded}" data-testid="NSidebar">
    <span v-for="catogery in navItems" :key="catogery.title">
      <br>
      <small v-for="menuitem in catogery.menu" :key="menuitem.title">
        <template v-if="menuitem.submenu">
          <NavItemNICollapsible
            v-if="expanded"
            :title="menuitem.title"
            :disabled="menuitem.disabled === true"
            :iconprop="menuitem.icon"
            :route="menuitem.route"
            :submenu="menuitem.submenu"
          />
          <!-- if menu collapsed: -->
          <NavItemNIDropdownHoverable
            v-else
            :title="menuitem.title"
            :disabled="menuitem.disabled === true"
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
            :disabled="menuitem.disabled === true"
            :icon="menuitem.icon"
            :route="menuitem.route"
          />
        </template>
      </small>
      <br>
    </span>
  </b-nav>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { IObjectString2Boolean } from '../../.utils/types/tgeneral'
import { Icons } from '../../mixins/icons'
import { IMenuItem } from '../../.utils/types/tobjects'
const config = namespace('config-app')

@Component({ mixins: [Icons] })
export default class NSidebar extends Vue {
  $route: any
  $nuxt: any
  icon: any // from mixin
  @Prop({ }) expanded!: boolean
  @config.Getter public config!: IObjectString2Boolean
  // get defaultAdminPage () { return (this.config && this.config['terminal.forbidden'] === true) ? '/admin' : '/adminterminal' } // seems not to work correctly.. click is not executed
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
            icon: this.icon.server,
            submenu: [
              { title: 'title.allDepots', route: '/depots/' },
              { title: 'title.config', route: '/depotsconfig' }
            ]
          },
          {
            title: 'title.clients',
            route: '/clients/',
            icon: this.icon.client,
            submenu: [
              { title: 'title.allClients', route: '/clients/' },
              { title: 'title.addNew', route: '/clientscreation', disabled: !this.config?.client_creation },
              // TODO: Display clone client when backend is ready
              // { title: 'title.clone', route: '/clientsclone' },
              { title: 'title.config', route: '/clientsconfig' },
              { title: 'title.log', route: '/clientslog' }
            ]
          },
          { title: 'title.products', icon: this.icon.product, route: '/products/' },
          { title: 'title.groups', icon: this.icon.group, route: '/groups/' }
        ]
      },
      {
        title: 'title.configure',
        menu: [
          {
            title: 'title.administration',
            route: '/adminmaintenance',
            // route: (this.config && this.config['terminal.forbidden'] === true) ? '/admin' : '/adminterminal',
            // route: this.defaultAdminPage,
            icon: this.icon.admin,
            submenu: [
              { title: 'title.adminterminal', route: '/adminterminal', disabled: (this.config && this.config['terminal.forbidden'] === true) },
              { title: 'title.healthcheck', route: '/adminserverhealthcheck' },
              { title: 'title.admin', route: '/adminmaintenance' },
              { title: 'form.modules', route: '/adminmodules' }
            ]
          },
          { title: 'title.support', icon: this.icon.support, route: '/support' }
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
