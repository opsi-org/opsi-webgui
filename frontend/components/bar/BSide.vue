<template>
  <div data-testid="BSide" class="bg-opsi-blue">
    <el-menu
      router
      unique-opened
      :default-active="router.currentRoute.value?.fullPath"
      :collapse="isCollapse"
      class="h-[90vh] bg-opsi-blue"
    >
      <template v-for="item in navItems" :key="item.title">
        <el-sub-menu v-if="item.submenu" :index="item.route" :route="item.route" :data-testid="'NSidebar-' + item.title">
          <template #title>
            <IconIIcon v-if="item.icon" :icon="item.icon" class="mr-2" />
            <span v-if="showTitle">{{ $t(item.title) }}</span>
          </template>
          <el-menu-item
            v-for="sub in item.submenu"
            :key="sub.title"
            :disabled="sub.disabled"
            :index="sub.route"
            :route="sub.route"
            :data-testid="'NICollapsible-submenu-' + sub.title"
          >
            <span>{{ $t(sub.title) }}</span>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item v-else :index="item.route" :route="item.route" :data-testid="'NSidebar-' + item.title">
          <IconIIcon v-if="item.icon" :icon="item.icon" class="mr-2" />
          <span v-if="showTitle">{{ $t(item.title) }}</span>
        </el-menu-item>
      </template>
    </el-menu>
    <div v-if="!mq.isMobile.value" class="text-center">
      <el-checkbox-button v-model="isCollapse">
        {{ isCollapse ? '>>' : 'Collapse' }}
      </el-checkbox-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useIcons } from '../../composables/mixins/useIcons'

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
  const { config } = storeToRefs(storeConfigapp())
  const isCollapse = ref(menuCollapsed.value)
  const emit = defineEmits(['changeSmall'])
  const navItems = computed<Array<INavItem>>(() => [
    {
      title: 'title.depots',
      route: '/servers/',
      icon: icons.depots,
      submenu: [
        { title: 'title.allDepots', route: '/servers/' },
        { title: 'title.config', route: '/servers/config' },
      ],
    },
    {
      title: 'title.clients',
      route: '/clients/',
      icon: icons.client,
      submenu: [
        { title: 'title.allClients', route: '/clients/' },
        {
          title: 'title.addNew',
          route: '/clients/create',
          disabled: !config.value?.client_creation,
        },
        { title: 'title.clone', route: '/clients/clone' },
        { title: 'title.config', route: '/clients/config' },
        { title: 'title.log', route: '/clients/logs' },
      ],
    },
    {
      title: 'title.products',
      icon: icons.product,
      route: '/products/LocalbootProduct',
    },
    { title: 'title.groups', icon: icons.group, route: '/groups/' },
    {
      title: 'title.administration',
      route: config.value?.['terminal.forbidden'] === true ? '/admin/' : '/admin/terminal',
      icon: icons.admin,
      submenu: [
        {
          title: 'title.adminterminal',
          route: '/admin/terminal',
          disabled: config.value?.['terminal.forbidden'] === true,
        },
        { title: 'title.healthcheck', route: '/admin/healthcheck' },
        { title: 'title.admin', route: '/admin/' },
        { title: 'form.modules', route: '/admin/modules' },
      ],
    },
    { title: 'title.support', icon: icons.support, route: '/support' },
  ])

  watch(isCollapse, (val) => emit('changeSmall', val))

  const isSelected = (item: INavItem) => item.route && router.currentRoute.value?.fullPath.includes(item.route)
  const showTitle = computed(() => mq.isMobile.value || !isCollapse.value)
</script>
