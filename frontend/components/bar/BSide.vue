<template>
  <!-- <b-sidebar
    id="sidemenu"
    visible
  >
    <b-nav vertical>
      <span v-for="item in navItems" :key="item.title">
        <template v-if="item.submenu">
          <b-nav-item
            :data-testid="'NIItem-'+item.title"
            v-b-toggle="'collapse-navitem-'+item.title"
            :title="$t(item.title)" class="NItem-nav-item"
            :to="item.route"
          >
              {{ $t(item.title) }} collapse
          </b-nav-item>
          <b-collapse :id="'collapse-navitem-'+item.title" accordion="sidebarAccordion">
            <b-nav vertical>
              <b-nav-item
                v-for="sub in item.submenu"
                :key="sub.title"
                :data-testid="'NICollapsible-submenu-'+item.title+sub.title"
                :to="sub.route"
              >
                  {{ $t(sub.title) }}
              </b-nav-item>
            </b-nav>
          </b-collapse>
        </template>
        <template v-else>
          <b-nav-item :data-testid="'NIItem-'+item.title" :title="$t(item.title)" class="NItem-nav-item" :to="item.route">
              {{ $t(item.title) }}
          </b-nav-item>
        </template>
      </span>
    </b-nav>
  </b-sidebar> -->

  <!-- <div class="h-full grid grid-cols-1 content-between"> -->
  <el-menu router :collapse="isCollapse" default-active="3" class="overflow-hidden">
    <span v-for="item in navItems" :key="item.title">
      <template v-if="item.submenu">
        <el-sub-menu :index="item.index" :to="item.route">

          <template #title>
            <!-- <el-icon><location /></el-icon> -->
            <IconIIcon v-if="item.icon" :icon="item.icon"/>
            <span v-if="!isCollapse">{{ $t(item.title) }}</span>
          </template>

          <!-- sub menus -->
          <span v-for="sub in item.submenu" :key="sub.title" :to="item.route">
            <el-menu-item :index="sub.index" :disabled="sub.disabled">
              <!-- <IconIIcon v-if="sub.icon " :icon="sub.icon"/> -->
              <span>{{ $t(sub.title) }}</span>
            </el-menu-item>
          </span>

        </el-sub-menu>
      </template>
      <template v-else>
        <el-menu-item :index="item.route" :to="item.route">

          <IconIIcon v-if="item.icon" :icon="item.icon"/>
            <span v-if="!isCollapse">{{ $t(item.title) }}</span>
          <!-- <IconIIcon v-if="item.icon" :icon="item.icon"/>
          <span>{{ $t(item.title) }}</span> -->
        </el-menu-item>
      </template>
    </span>

  </el-menu>
  <div class="absolute inset-x-0 bottom-0">
    <el-checkbox-button v-model="isCollapse">
        {{ isCollapse ? 'Expand' : 'Collapse' }}
    </el-checkbox-button>
  </div>
<!-- </div> -->
</template>

<script setup lang="ts">

import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
} from '@element-plus/icons-vue'
import {useIcons} from '../../composables/mixins/useIcons'
const icons = useIcons()
const configStore = storeConfigapp()
const mq = useMQ()
const isCollapse = ref(false)
const navItems = [
  {
    index: '1',
    title: 'title.depots',
    route: '/depots/',
    icon: icons.server,
    submenu: [
      { index: '1-1', title: 'title.allDepots', route: '/depots/'},
      { index: '1-2', title: 'title.config', route: '/depotsconfig'}
    ]
  },
  {
    index: '2',
    title: 'title.clients',
    route: '/clients/',
    icon: icons.client,
    submenu: [
      { index: '2-1', title: 'title.allClients', route: '/clients/'},
      { index: '2-2', title: 'title.addNew', route: '/clientscreation', disabled: !configStore.config?.client_creation },
      // TODO: Display clone client when backend is ready
      // { title: 'title.clone', route: '/clientsclone' },
      { index: '2-3', title: 'title.config', route: '/clientsconfig' },
      { index: '2-4', title: 'title.log', route: '/clientslog' }
    ]
  },
  { index: '3', title: 'title.products', icon: icons.product, route: '/products/' },
  { index: '4', title: 'title.groups', icon: icons.group, route: '/groups/' },

  {
    index: '5',
    title: 'title.administration',
    route: (configStore.config && configStore.config['terminal.forbidden'] === true) ? '/admin' : '/adminterminal',
    icon: icons.admin,
    submenu: [
      { index: '5-1', title: 'title.adminterminal', route: '/adminterminal', disabled: (configStore.config && configStore.config['terminal.forbidden'] === true) },
      { index: '5-2', title: 'title.healthcheck', route: '/adminserverhealthcheck' },
      { index: '5-3', title: 'title.admin', route: '/admin' },
      { index: '5-4', title: 'form.modules', route: '/adminmodules' }
    ]
  },
  { index: '6', title: 'title.support', icon: icons.support, route: '/support' }
  // { title: 'Index page', icon: 'collection-fill', route: '/' }
]
</script>

<style scoped>
#sidemenu {
  top: calc(var(--height-navbar) - 2px) !important;
  width: 200px;
  height: 100% !important;
}

.el-menu {
  /* min-height: 100% !important; */
}
</style>
