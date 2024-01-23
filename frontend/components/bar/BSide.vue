<template>
  <el-menu router
    :default-active="useRouter().currentRoute.value?.fullPath"
    :collapse="!isMobile && isCollapse"
    class="el-menu-mywrapper overflow-hidden max-w-full"
    style="--el-menu-icon-width: 244px;"
  >
  <!-- :class="{collapse: !isCollapse}" -->
    <span v-for="item in navItems" :key="item.title">
      <template v-if="item.submenu">
        <!-- menus with children -->
        <el-sub-menu :index="item.route" :route="item.route"
        popper-class="text-on-primary"
        :data-testid="'NSidebar-' + item.title"
        >
        <!-- :expand-open-icon="isCollapse ? ' ' : ''" :expand-close-icon="isCollapse ? ' ' : ''" -->
          <template #title>
            <div
            class="text-on-primary"
            :class="{
              'contents': true,
              'selected': item.routeSubpath && useRouter().currentRoute.value?.fullPath.includes(item.routeSubpath),
            }"
            >
              <IconIIcon v-if="item.icon" :icon="item.icon" class="mr-1"/>
              <span v-if="isMobile || !isCollapse" >{{ $t(item.title) }}</span>
              <div class="min-w-full"></div>
              <!-- <div class="flex-grow" />
                <IconIIcon v-if="item.icon" :icon="icons.arrowDoubleDown"/> -->
              </div>
          </template>

          <!-- sub menus -->
          <span v-for="sub in item.submenu" :key="sub.title" >
            <el-menu-item :disabled="sub.disabled" :index="sub.route" :route="sub.route"
            :data-testid="'NICollapsible-submenu-' + sub.title" class="text-on-primary">
              <span class="text-on-primary">{{ $t(sub.title) }}</span>
            </el-menu-item>
          </span>

        </el-sub-menu>
      </template>
      <template v-else>
        <!-- menus without children -->
        <el-menu-item :index="item.route" :route="item.route" class="text-on-primary"
        :data-testid="'NSidebar-' + item.title">
          <IconIIcon v-if="item.icon" :icon="item.icon" class="mr-1" />
            <span v-if="isMobile || !isCollapse">{{ $t(item.title) }}</span>
        </el-menu-item>
      </template>
    </span>

  </el-menu>
  <div v-if="!isMobile" class="menu-footer absolute inset-x-0 bottom-0 w-full text-on-primary">
    <el-checkbox-button v-model="isCollapse" class="w-full text-on-primary" type="">
        {{ isCollapse ? '>>' : 'Collapse' }}
    </el-checkbox-button>
  </div>
</template>

<script setup lang="ts">
import {useIcons} from '../../composables/mixins/useIcons'
const icons = useIcons()
const {config} = storeToRefs(storeConfigapp())
const settings = storeSettings()
const { isMobile, menuCollapsed } = storeToRefs(settings)
const mq = useMQ()
const isCollapse = ref(menuCollapsed.value)
interface INavItem {
  title: string
  route: string
  routeSubpath?: string
  icon?: string
  disabled?: boolean
  submenu?: Array<INavItem>
}
const emit = defineEmits(['changeSmall'])
const { selectionDepots } = storeSelections()
const navItems = computed<Array<INavItem>>(() =>
// const navItems:Array<INavItem> =
  [
  {
    title: 'title.depots',
    routeSubpath: '/servers/',
    route: '/servers/',
    icon: icons.server,
    submenu: [
      { title: 'title.allDepots', route: '/servers/'},
      { title: 'title.config', route: '/servers/config'}
    ]
  },
  {
    title: 'title.clients',
    route: '/clients/',
    routeSubpath: '/clients/',
    icon: icons.client,
    submenu: [
      { title: 'title.allClients', route: '/clients/'},
      { title: 'title.addNew', route: '/clients/create', disabled: !config.value?.client_creation },
      // TODO: Display clone client when backend is ready
      { title: 'title.clone', route: '/clients/clone' },
      { title: 'title.config', route: '/clients/config' },
      { title: 'title.log', route: '/clients/logs' }
    ]
  },
  { title: 'title.products', icon: icons.product, route: '/products/LocalbootProduct' },
  { title: 'title.groups', icon: icons.group, route: '/groups/' },

  {
    title: 'title.administration',
    route: (config.value?.['terminal.forbidden'] === true) ? '/admin/' : '/admin/terminal',
    routeSubpath: '/admin',
    icon: icons.admin,
    submenu: [
      { title: 'title.adminterminal', route: '/admin/terminal', disabled: (config.value?.['terminal.forbidden'] === true) },
      { title: 'title.healthcheck', route: '/admin/healthcheck' },
      { title: 'title.admin', route: '/admin/' },
      { title: 'form.modules', route: '/admin/modules' }
    ]
  },
  { title: 'title.support', icon: icons.support, route: '/support' }
]
)

watch(isCollapse, (val: boolean) => {
  console.log('change isCollapse', val)
  emit('changeSmall', val)
})
</script>

<style scoped>
.contents {
  display: contents !important;
  /* max-width: 100px !important; */
}
.selected {
  color: var(--el-color-primary);
  color: var(--el-menu-active-color);
}
:deep(.el-menu-item.is-active path) {
  color: var(--el-color-primary) !important;
  color: var(--el-menu-active-color) !important;
}
/* :deep(.el-sub-menu__icon-arrow) {
color: white !important;
} */

  :deep(.el-sub-menu__icon-arrow) {
  /* .el-menu--collapse >>> .el-sub-menu__icon-arrow { */
    /* display: none !important; */
    margin-right: -10px !important;

    --el-text-color-regular: var(--opsi-genral-white);
    color: var(--el-text-color-regular);
  }

  :deep(.el-checkbox-button__inner) {
  /* .menu-footer >>> .el-checkbox-button__inner{ */
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
  :deep(.iconify) {
    min-width: 40px;
  }
  :deep(.el-sub-menu__title) {
    max-width: 100% !important;
    padding: 5px !important;
    text-align: left;
  }
  .el-menu > span > .el-menu-item {
    padding-left: 50px !important;
  }
  .el-menu-mywrapper > span > .el-menu-item {
    padding-left: 5px !important;
  }
</style>
