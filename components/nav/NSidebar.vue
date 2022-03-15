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
            <b-nav-item v-if="expert && changesProducts.length!==0" variant="success" :to="menuitem.route" class="NItem-nav-item">
              <b-icon v-b-tooltip.hover variant="success" :title="$t(menuitem.title)" class="" :icon="menuitem.icon" />
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
import { Component, Prop, Vue, namespace } from 'nuxt-property-decorator'
import { ChangeObj } from '../../.utils/types/tchanges'
const settings = namespace('settings')
const changes = namespace('changes')

interface IMenuItem {
  title:string
  route?: string
  icon?: string
  submenu?: Array<IMenuItem>
  menu?: Array<IMenuItem>
}

@Component
export default class NSidebar extends Vue {
  @Prop({ }) expanded!: boolean

  @settings.Getter public expert!: boolean;
  @changes.Getter public changesProducts!: Array<ChangeObj>;

  navItems : Array<IMenuItem> = [
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
          icon: 'hdd-network',
          submenu: [
            { title: 'title.allDepots', route: '/depots' },
            { title: 'title.config', route: '/depotsconfig' }
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
        { title: 'title.products', icon: 'grid', route: '/products/' },
        { title: 'Track Changes', icon: 'list-check', route: '/changes/' }
      ]
    },
    {
      title: 'title.configure',
      menu: [
        { title: 'title.support', icon: 'headset', route: '/support' },
        { title: 'title.settings', icon: 'gear', route: '/settings' }
        // { title: 'Index page', icon: 'collection-fill', route: '/' }
      ]
    }
  ]
}
</script>

<style>
.navbar-light .navbar-nav .nav .nav-item{
  color: inherit !important;
  font-weight: normal !important;
  padding-top: 0px;
  padding-bottom: 0px;
}

.sidemenu_nav{
  position:absolute;
  width: 100%;
  max-height:70vh;
}

.sidebar_collapsed .sidemenu_nav .nav-item{
  margin-right: 0px !important;
}
.sidebar_collapsed .sidemenu_nav .nav-link > svg{
  width: 100% !important;
  margin: 0 auto !important;
}
.timer {
  margin-left: 15px;
  margin-top: 5px;
}
</style>
