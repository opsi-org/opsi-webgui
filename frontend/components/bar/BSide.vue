<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div data-testid="BSide" class="bg-opsi-blue">
    <el-menu
      router
      unique-opened
      class="h-[90vh] bg-opsi-blue"
      :default-active="router.currentRoute.value?.path"
      :collapse="isCollapse"
    >
      <template v-for="item in navItems" :key="item.title">
        <el-sub-menu
          v-if="item.submenu"
          :index="item.route.split('?')[0]"
          :route="item.route"
          :data-testid="'NSidebar-' + item.title"
        >
          <template #title>
            <IconIIcon v-if="item.icon" :icon="item.icon" class="mr-2" />
            <p-overlay-badge
              v-if="
                item.title === 'administration' &&
                !menuOpened('administration') &&
                config?.health?.worst_case
              "
              class="text-xs"
              :severity="
                config?.health?.worst_case == 'error'
                  ? 'danger'
                  : config?.health?.worst_case == 'warning'
                    ? 'warning'
                    : 'success'
              "
            >
              <span v-if="showTitle" class="pr-3">{{ $t(item.title) }}</span>
            </p-overlay-badge>
            <span v-else-if="showTitle">{{ $t(item.title) }}</span>
          </template>
          <el-menu-item
            v-for="sub in item.submenu"
            :key="sub.title"
            :disabled="sub.disabled"
            :index="sub.route.split('?')[0]"
            :route="sub.route"
            :data-testid="'NICollapsible-submenu-' + sub.title"
          >
            <p-overlay-badge
              v-if="sub.title === 'healthCheck' && config?.health?.worst_case"
              class="overlay-badge-value"
              size="small"
              :value="config?.health?.counts?.[config?.health?.worst_case] || 5"
              :severity="
                config?.health?.worst_case == 'error'
                  ? 'danger'
                  : config?.health?.worst_case == 'warning'
                    ? 'warning'
                    : 'success'
              "
            >
              <span class="pr-3">{{ $t(sub.title) }}</span>
            </p-overlay-badge>
            <span v-else>{{ $t(sub.title) }}</span>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item
          v-else
          :index="item.route.split('?')[0]"
          :route="item.route"
          :data-testid="'NSidebar-' + item.title"
        >
          <IconIIcon v-if="item.icon" :icon="item.icon" class="mr-2" />
          <span v-if="showTitle">{{ $t(item.title) }}</span>
        </el-menu-item>
      </template>
    </el-menu>
    <div v-if="!mq.isMobile.value" class="text-center">
      <el-checkbox-button v-model="isCollapse">
        <span v-if="isCollapse">
          <IconIIcon :icon="icons.arrowDoubleRight" />
        </span>
        <span v-else>
          {{ $t('collapse') }}
        </span>
      </el-checkbox-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface INavItem {
    title: string
    route: string
    icon?: string
    disabled?: boolean
    submenu?: Array<INavItem>
  }
  const emit = defineEmits(['changeSmall'])

  const $t = useI18n().t
  const icons = useIcons()
  const router = useRouter()
  const mq = useMQ()

  const settings = storeSettings()
  const { menuCollapsed } = storeToRefs(settings)
  const { config } = storeToRefs(storeConfigapp())

  const isCollapse = ref(menuCollapsed.value && !mq.isMobile.value)

  const navItems = computed<Array<INavItem>>(() => [
    {
      title: 'depots',
      route: '/servers/',
      icon: icons.depots,
      submenu: [
        { title: 'allDepots', route: '/servers/' },
        { title: 'configuration', route: '/servers/config' },
      ],
    },
    {
      title: 'clients',
      route: '/clients/',
      icon: icons.client,
      submenu: [
        { title: 'allClients', route: '/clients/' },
        {
          title: 'addNew',
          route: '/clients/create',
          disabled: !config.value?.client_creation,
        },
        { title: 'clone', route: '/clients/clone' },
        { title: 'configuration', route: '/clients/config' },
        { title: 'logs', route: '/clients/logs' },
      ],
    },
    {
      title: 'products',
      icon: icons.product,
      route: '/products/LocalbootProduct',
    },
    { title: 'groups', icon: icons.group, route: '/groups/' },
    {
      title: 'administration',
      route: config.value?.['terminal.forbidden'] === true ? '/admin/general' : '/admin/terminal',
      icon: icons.admin,
      submenu: [
        {
          title: 'terminal',
          route: '/admin/terminal',
          disabled: config.value?.['terminal.forbidden'] === true,
        },
        { title: 'healthCheck', route: '/admin/diagnostics?id=health' },
        { title: 'general', route: '/admin/general' },
        { title: 'modules', route: '/admin/modules' },
      ],
    },
    { title: 'support', icon: icons.support, route: '/support' },
  ])

  watch(
    () => mq.$mq.value,
    () => {
      settings.setIsMobile(mq.$mq.value === 'mobile')
      isCollapse.value = menuCollapsed.value && !mq.isMobile.value
    }
  )

  watch(
    () => isCollapse.value,
    (val) => {
      emit('changeSmall', val)
    }
  )

  const showTitle = computed(() => mq.isMobile.value || !isCollapse.value)

  function menuOpened(title: string) {
    const currentRoute = router.currentRoute.value
    return currentRoute.path.startsWith(title) || currentRoute.path === title
  }
</script>

<style lang="css" scoped>
  :deep(.overlay-badge-value > .p-badge) {
    transform: translate(50%, 0%) !important;
  }
</style>
