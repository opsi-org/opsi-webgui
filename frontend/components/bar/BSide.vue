<template>
  <el-menu router :collapse="isCollapse" default-active="3" class="overflow-hidden max-w-fit">
    <span v-for="item in navItems" :key="item.title">
      <template v-if="item.submenu">
        <!-- menus with children -->
        <el-sub-menu :index="item.index" :to="item.route">
          <template #title>
            <IconIIcon v-if="item.icon" :icon="item.icon"/>
            <span v-if="!isCollapse">{{ $t(item.title) }}</span>
          </template>

          <!-- sub menus -->
          <span v-for="sub in item.submenu" :key="sub.title" :to="item.route">
            <el-menu-item :index="sub.index" :disabled="sub.disabled">
              <span>{{ $t(sub.title) }}</span>
            </el-menu-item>
          </span>

        </el-sub-menu>
      </template>
      <template v-else>
        <!-- menus without children -->
        <el-menu-item :index="item.route" :to="item.route">
          <IconIIcon v-if="item.icon" :icon="item.icon"/>
            <span v-if="!isCollapse">{{ $t(item.title) }}</span>
        </el-menu-item>
      </template>
    </span>

  </el-menu>
  <div class="absolute inset-x-0 bottom-0">
    <el-checkbox-button v-model="isCollapse">
        {{ isCollapse ? 'Expand' : 'Collapse' }}
    </el-checkbox-button>
  </div>
</template>

<script setup lang="ts">
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
]
</script>

<style scoped>
</style>
