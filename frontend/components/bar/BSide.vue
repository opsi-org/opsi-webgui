<template>
  <div data-testid="BSide">
    <el-menu router :default-active="router.currentRoute.value?.fullPath" :collapse="isCollapse"
      class="el-menu-mywrapper overflow-hidden max-w-full" :class="{'max-height-side': !mq.isMobile.value }"
      style="--el-menu-icon-width: 244px;" type="primary">
      <span v-for="item in navItems" :key="item.title">
        <el-sub-menu v-if="item.submenu" :index="item.route" :route="item.route"
          popper-class="text-on-primary" class="text-on-primary" :data-testid="'NSidebar-' + item.title">
          <template #title>
            <div class="text-on-primary" :class="{'contents': true, 'selected': isSelected(item)}">
              <IconIIcon v-if="item.icon" :icon="item.icon" class="mr-1"/>
              <span v-if="showTitle">{{ $t(item.title) }}</span>
            </div>
          </template>
          <el-menu-item v-for="sub in item.submenu" :key="sub.title" :disabled="sub.disabled" :index="sub.route" :route="sub.route"
            :data-testid="'NICollapsible-submenu-' + sub.title" class="text-on-primary">
            <span class="text-on-primary">{{ $t(sub.title) }}</span>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item v-else :index="item.route" :route="item.route" class="text-on-primary"
          :data-testid="'NSidebar-' + item.title">
          <IconIIcon v-if="item.icon" :icon="item.icon" class="mr-1" />
          <span v-if="showTitle">{{ $t(item.title) }}</span>
        </el-menu-item>
      </span>
    </el-menu>
    <div v-if="!mq.isMobile.value" class="menu-footer relative inset-x-0 bottom-10 w-full text-on-primary">
      <el-checkbox-button v-model="isCollapse" class="w-full text-on-primary" type="">
        {{ isCollapse ? '>>' : 'Collapse' }}
      </el-checkbox-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useIcons} from '../../composables/mixins/useIcons'

interface INavItem {
  title: string
  route: string
  icon?: string
  disabled?: boolean
  submenu?: Array<INavItem>
}

const icons = useIcons()
const router = useRouter()
const mq = useMQ()
const settings = storeSettings()
const { menuCollapsed } = storeToRefs(settings)
const {config} = storeToRefs(storeConfigapp())
const isCollapse = ref(menuCollapsed.value)
const emit = defineEmits(['changeSmall'])
const navItems = computed<Array<INavItem>>(() => [
  {
    title: 'title.depots',
    route: '/servers/',
    icon: icons.depots,
    submenu: [
      { title: 'title.allDepots', route: '/servers/'},
      { title: 'title.config', route: '/servers/config'}
    ]
  },
  {
    title: 'title.clients',
    route: '/clients/',
    icon: icons.client,
    submenu: [
      { title: 'title.allClients', route: '/clients/'},
      { title: 'title.addNew', route: '/clients/create', disabled: !config.value?.client_creation },
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
    icon: icons.admin,
    submenu: [
      { title: 'title.adminterminal', route: '/admin/terminal', disabled: (config.value?.['terminal.forbidden'] === true) },
      { title: 'title.healthcheck', route: '/admin/healthcheck' },
      { title: 'title.admin', route: '/admin/' },
      { title: 'form.modules', route: '/admin/modules' }
    ]
  },
  { title: 'title.support', icon: icons.support, route: '/support' }
])

watch(isCollapse, (val: boolean) => {
  emit('changeSmall', val)
})

const isSelected = (item: INavItem) => item.route && router.currentRoute.value?.fullPath.includes(item.route)
const showTitle = computed(() => mq.isMobile.value || !isCollapse.value)
</script>

<style scoped>
.contents{display:contents!important}.selected{color:var(--el-color-primary);color:var(--el-menu-active-color)}.max-height-side{height:calc(100vh - 72px)}:deep(.el-menu-item.is-active path){color:var(--opsi-genral-white)!important;color:var(--el-menu-active-color)!important}:deep(.el-menu-item.is-active),:deep(.el-menu-item.is-active svg),:deep(.el-sub-menu.is-active > .el-sub-menu__title){--el-menu-active-color:var(--opsi-genral-white);color:var(--opsi-genral-white);background-color:var(--primary-color-dark)}.el-menu-item.text-on-primary:hover,.el-menu-item.text-on-primary:hover .text-on-primary,:deep(.el-sub-menu__title:hover .text-on-primary),:deep(.el-sub-menu__title:hover .el-sub-menu__icon-arrow){--el-text-color-regular:var(--fg-color)!important;color:var(--el-text-color-regular)!important}:deep(.el-sub-menu__icon-arrow){margin-right:-10px!important;--el-text-color-regular:var(--opsi-genral-white);color:var(--el-text-color-regular)}:deep(.el-checkbox-button__inner){width:100%!important;background-color:var(--el-checkbox-button-bg-color);border:0;border-top:1px solid var(--el-menu-border-color)}.el-menu-mywrapper{border:0!important}:deep(.iconify){min-width:40px}:deep(.el-sub-menu__title){max-width:100%!important;padding:5px!important;text-align:left}.el-menu > span > .el-menu-item{padding-left:50px!important}.el-menu-mywrapper > span > .el-menu-item{padding-left:5px!important}
</style>