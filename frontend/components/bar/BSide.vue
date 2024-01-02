<template>
  <el-menu router :default-active="useRouter().currentRoute.value?.fullPath" :collapse="isCollapse" class="el-menu-mywrapper overflow-hidden max-w-full"
  >
  <!-- :class="{collapse: !isCollapse}" -->
    <span v-for="item in navItems" :key="item.title">
      <template v-if="item.submenu">
        <!-- menus with children -->
        <el-sub-menu :index="item.route" :route="item.route" :expand-open-icon="isCollapse ? ' ' : ''" :expand-close-icon="isCollapse ? ' ' : ''">
          <template #title>
            <IconIIcon v-if="item.icon" :icon="item.icon"/>
            <span v-if="!isCollapse">{{ $t(item.title) }}</span>
            <!-- <div class="flex-grow" />
            <IconIIcon v-if="item.icon" :icon="icons.arrowDoubleDown"/> -->
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
  <div v-if="!isMobile" class="menu-footer absolute inset-x-0 bottom-0 w-full">
    <el-checkbox-button v-model="isCollapse" class="w-full" type="">
        {{ isCollapse ? '>>' : 'Collapse' }}
    </el-checkbox-button>
  </div>
</template>

<script setup lang="ts">
import {useIcons} from '../../composables/mixins/useIcons'
const icons = useIcons()
const configStore = storeConfigapp()
const settings = storeSettings()
const { isMobile, menuCollapsed } = storeToRefs(settings)
const mq = useMQ()
const isCollapse = ref(menuCollapsed.value)
interface INavItem {
  title: string
  route: string
  icon?: string
  disabled?: boolean
  submenu?: Array<INavItem>
}
const emit = defineEmits(['changeSmall'])
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
watch(isCollapse, (val) => {
  console.log('change isCollapse', val)
  emit('changeSmall', val)
})
</script>

<style scoped>
  .el-menu--collapse >>> .el-sub-menu__icon-arrow {
    /* display: none !important; */
    margin-right: -10px !important;
  }
  .menu-footer >>> .el-checkbox-button__inner{
    width: 100% !important;
    background-color: var(--el-checkbox-button-bg-color);
    border: 0px;
    border-top: 1px solid var(--el-menu-border-color);
    /* border-top: 1px solid var(--el-checkbox-button-checked-text-color); */
  }

  /* .el-aside >>> */
  .el-menu-mywrapper  {
    border: 0 !important;
    /* border-color: green !important; */
  }
</style>
