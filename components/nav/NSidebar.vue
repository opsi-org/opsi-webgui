<template>
  <b-nav vertical tabs class="sidemenu_nav" data-testid="NSidebar">
    <span v-for="catogery in navItems" :key="catogery.title">
      <br>
      <!-- <NavItemNITitle :expanded="expanded" :title="catogery.title" /> -->
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
          <template v-if="menuitem.title == 'Track Changes'">
            <b-nav-item v-if="expert || changesProducts.filter((o) => o.user === username).length!==0" :to="menuitem.route">
              <b-icon v-b-tooltip.hover :title="$t(menuitem.title)" :icon="menuitem.icon" />
              <span v-if="expanded">
                {{ $t(menuitem.title) }}
              </span>
            </b-nav-item>
          </template>
          <NavItemNIItem v-else :expanded="expanded" :title="menuitem.title" :icon="menuitem.icon" :route="menuitem.route" />
        </template>
      </span>
      <br>
    </span>
  </b-nav>
</template>

<script lang="ts">
import { Component, Prop, namespace, Vue } from 'nuxt-property-decorator'
import { ChangeObj } from '../../.utils/types/tchanges'
import { Constants } from '../../mixins/uib-mixins'
const settings = namespace('settings')
const changes = namespace('changes')

interface IMenuItem {
  title:string
  route?: string
  icon?: string
  submenu?: Array<IMenuItem>
  menu?: Array<IMenuItem>
}

@Component({ mixins: [Constants] })
export default class NSidebar extends Vue {
  iconnames: any // from mixin
  @Prop({ }) expanded!: boolean

  @settings.Getter public expert!: boolean;
  @changes.Getter public changesProducts!: Array<ChangeObj>;

  created () {
    console.log('constants: ', this.iconnames)
  }

  get username () {
    return localStorage.getItem('username')
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
              { title: 'title.allDepots', route: '/depots' },
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
          { title: 'title.products', icon: this.iconnames.product, route: '/products/' },
          { title: 'Track Changes', icon: this.iconnames.changes, route: '/changes/' }
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
.navbar-light .navbar-nav .nav .nav-item{
  color: inherit !important;
  font-weight: normal !important;
  padding-top: 0px;
  padding-bottom: 0px;
}
#sidemenu .b-sidebar-body {
  display: inline-block;
  width: inherit;
  /* height: inherit;
  max-height: inherit; */
  max-height: calc(100% - var(--height-navbar) - 80px);
  /* max-height: 200px; */
}
.sidemenu_nav{
  display: inline-flex;
  position: absolute;
  flex-wrap: nowrap !important;
  /* width: 100%; */
  /* overflow-y: auto; */
  /*overflow-x: visible; /*horizontal scrollbar*/
  width: 100%;
  height: 100%;
  overflow-x: visible;
}

.sidebar_collapsed .sidemenu_nav .nav-item{
  margin-right: 0px !important;
}
.sidebar_collapsed .sidemenu_nav .nav-link > svg{
  /* width: 100% !important; */
  margin: 0 auto !important;
}
.timer {
  margin: auto;
  /* margin-left: 15px;
  margin-top: 5px; */
}
</style>
