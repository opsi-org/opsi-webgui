<template>
  <el-menu router :default-active="useRouter().currentRoute.value.fullPath" :collapse="isCollapse" class="overflow-hidden max-w-fit">
    <span v-for="item in navItems" :key="item.title">
      <template v-if="item.submenu">
        <!-- menus with children -->
        <el-sub-menu :index="item.route" :route="item.route">
          <template #title>
            <IconIIcon v-if="item.icon" :icon="item.icon"/>
            <span v-if="!isCollapse">{{ $t(item.title) }}</span>
          </template>

          <!-- sub menus -->
          <span v-for="sub in item.submenu" :key="sub.title" >
            <el-menu-item :disabled="sub.disabled" :index="sub.route" :route="sub.route">
              <span>{{ $t(sub.title) }}</span>
            </el-menu-item>
          </span>

        </el-sub-menu>
      </template>
      <template v-else>
        <!-- menus without children -->
        <el-menu-item :index="item.route" :route="item.route">
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
interface INavItem {
  title: string
  route: string
  icon?: string
  disabled?: boolean
  submenu?: Array<INavItem>
}
const navItems:Array<INavItem> = [
  {
    title: 'title.depots',
    route: '/depots/',
    icon: icons.server,
    submenu: [
      { title: 'title.allDepots', route: '/depots/'},
      { title: 'title.config', route: '/depotsconfig'}
    ]
  },
  {
    title: 'title.clients',
    route: '/clients/',
    icon: icons.client,
    submenu: [
      { title: 'title.allClients', route: '/clients/'},
      { title: 'title.addNew', route: '/clientscreation', disabled: !configStore.config?.client_creation },
      // TODO: Display clone client when backend is ready
      // { title: 'title.clone', route: '/clientsclone' },
      { title: 'title.config', route: '/clientsconfig' },
      { title: 'title.log', route: '/clientslog' }
    ]
  },
  { title: 'title.products', icon: icons.product, route: '/products/' },
  { title: 'title.groups', icon: icons.group, route: '/groups/' },

  {
    title: 'title.administration',
    route: (configStore.config && configStore.config['terminal.forbidden'] === true) ? '/admin' : '/adminterminal',
    icon: icons.admin,
    submenu: [
      { title: 'title.adminterminal', route: '/adminterminal', disabled: (configStore.config && configStore.config['terminal.forbidden'] === true) },
      { title: 'title.healthcheck', route: '/adminserverhealthcheck' },
      { title: 'title.admin', route: '/admin' },
      { title: 'form.modules', route: '/adminmodules' }
    ]
  },
  { title: 'title.support', icon: icons.support, route: '/support' }
]
</script>

<style scoped>
</style>
