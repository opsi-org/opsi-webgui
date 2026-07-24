<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  LayoutsSidebar - Main navigation sidebar with collapsible menu items or popup based on expanded state.
-->
<template>
  <nav class="h-full flex flex-col bg-opsi-blue text-white opsi-compact-page">
    <div :class="['flex-1 py-1', collapsed ? 'overflow-visible' : 'overflow-y-auto']">
      <template v-for="(group, groupIdx) in navGroups" :key="groupIdx">
        <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- hover-popup wrapper; interactive content provided by child links/buttons -->
        <div
          v-for="item in group"
          :key="item.route"
          class="relative mx-0.5"
          @mouseenter="onHover(item.route, $event)"
          @mouseleave="onLeave"
          @focusin="onHover(item.route, $event)"
          @focusout="onLeave"
        >
          <template v-if="item.submenu">
            <template v-if="!collapsed">
              <CoreAppButton
                @click="toggleSubmenu(item.route)"
                variant="ghost"
                color="neutral"
                class="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-white hover:bg-white/15 active:bg-white/15! focus:bg-transparent! transition-colors duration-100"
                :class="{ 'bg-white/10': isActive(item.route) && !expanded[item.route] }"
              >
                <CoreAppIcon :name="item.icon" class="w-5 h-5 shrink-0" />
                <span class="flex-1 text-xs text-left">{{ t(item.title) }}</span>
                <CoreAppIcon
                  :name="expanded[item.route] ? icons.chevronUp : icons.chevronDown"
                  class="w-4 h-4 transition-transform"
                />
              </CoreAppButton>
              <div
                v-if="expanded[item.route]"
                class="ml-3 mt-0.5 mb-1 border-l-2 border-white/20 pl-1"
              >
                <NuxtLink
                  v-for="sub in item.submenu"
                  :key="sub.route"
                  :to="sub.route"
                  :data-testid="linkTestId(sub.route)"
                  class="flex items-center gap-2 px-2 py-1 rounded-lg text-xs transition-colors duration-100"
                  :class="
                    isSubActive(sub.route, item.submenu)
                      ? 'bg-(--ui-color-primary-200) text-(--color-opsi-deep-blue) font-medium'
                      : 'text-white/80 hover:text-white hover:bg-white/15'
                  "
                >
                  {{ t(sub.title) }}
                </NuxtLink>
              </div>
            </template>

            <template v-else>
              <NuxtLink
                :to="item.submenu[0]?.route || item.route"
                class="flex items-center justify-center py-2 rounded-lg hover:bg-white/15 transition-colors duration-100"
                :class="{ 'bg-white/10': isActive(item.route) }"
                :title="t(item.title)"
              >
                <CoreAppIcon :name="item.icon" class="w-5 h-5" />
              </NuxtLink>
              <Teleport to="body">
                <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- hover-popup wrapper; interactive content provided by child links -->
                <div
                  v-if="hoveredItem === item.route"
                  :style="getPopupPosition(item.route)"
                  @mouseenter="keepPopupOpen(item.route)"
                  @mouseleave="onLeave"
                  @focusin="keepPopupOpen(item.route)"
                  @focusout="onLeave"
                  class="fixed bg-opsi-blue rounded-xl shadow-lg min-w-44 py-1 z-100 border border-white/10"
                >
                  <div
                    class="px-3 py-2 font-heading text-xs text-white/70 border-b border-white/10"
                  >
                    {{ t(item.title) }}
                  </div>
                  <NuxtLink
                    v-for="sub in item.submenu"
                    :key="sub.route"
                    :to="sub.route"
                    @click="hoveredItem = null"
                    class="flex items-center px-2 py-1 rounded-lg mx-1 my-0.5 text-xs transition-colors duration-100"
                    :class="
                      isSubActive(sub.route, item.submenu)
                        ? 'bg-(--ui-color-primary-200) text-(--color-opsi-deep-blue) font-medium'
                        : 'text-white/80 hover:text-white hover:bg-white/15'
                    "
                  >
                    {{ t(sub.title) }}
                  </NuxtLink>
                </div>
              </Teleport>
            </template>
          </template>

          <template v-else>
            <NuxtLink
              :to="item.route"
              :data-testid="linkTestId(item.route)"
              class="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-100"
              :class="[
                $route.path === item.route
                  ? 'bg-(--ui-color-primary-200) text-(--color-opsi-deep-blue) font-medium'
                  : isActive(item.route)
                    ? 'text-white bg-white/10 hover:bg-white/15'
                    : 'text-white hover:bg-white/15',
                collapsed ? 'justify-center' : '',
              ]"
              :title="collapsed ? t(item.title) : undefined"
            >
              <CoreAppIcon :name="item.icon" class="w-5 h-5 shrink-0" />
              <span v-if="!collapsed" class="text-xs">{{ t(item.title) }}</span>
            </NuxtLink>
          </template>
        </div>
        <div v-if="groupIdx < navGroups.length - 1" class="my-3"></div>
      </template>
    </div>
  </nav>
</template>

<script setup lang="ts">
  defineProps<{
    collapsed: boolean
    isMobile: boolean
  }>()

  const icons = useIcons()
  const { t: $t } = useI18n()
  const $route = useRoute()
  const { filterNavItems } = useUserPermissions()

  const expanded = ref<Record<string, boolean>>({})
  const hoveredItem = ref<string | null>(null)
  const itemPositions = ref<Record<string, { top: number; left: number }>>({})
  let hoverTimeout: ReturnType<typeof setTimeout> | null = null

  const t = (key: string) => {
    const navKey = `nav.${key}`
    const translated = $t(navKey)
    if (translated && translated !== navKey) return String(translated)
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim()
  }

  /** Stable, locale-independent test id for a nav link, e.g. /admin/terminal -> nav-admin-terminal. */
  const linkTestId = (route: string) =>
    `nav-${route.replace(/^\//, '').replace(/\//g, '-') || 'root'}`

  function getPopupPosition(route: string) {
    const pos = itemPositions.value[route]
    if (!pos) return { top: '0px', left: '0px' }
    return {
      top: `${pos.top}px`,
      left: `${pos.left}px`,
    }
  }

  interface NavItem {
    title: string
    route: string
    icon: string
    submenu?: { title: string; route: string }[]
  }

  const navGroups = computed<NavItem[][]>(() => {
    const rawGroups: NavItem[][] = [
      [
        {
          title: 'dashboard',
          route: '/dashboard',
          icon: icons.dashboard,
        },
        {
          title: 'admin',
          route: '/admin',
          icon: icons.admin,
          submenu: [
            { title: 'terminal', route: '/admin/terminal' },
            { title: 'diagnostics', route: '/admin/diagnostics' },
            { title: 'maintenance', route: '/admin/maintenance' },
          ],
        },
      ],
      [
        {
          title: 'servers',
          route: '/servers',
          icon: icons.serverStack,
          submenu: [
            { title: 'allServers', route: '/servers' },
            { title: 'configuration', route: '/servers/configuration/parameters' },
          ],
        },
        {
          title: 'clients',
          route: '/clients',
          icon: icons.client,
          submenu: [
            { title: 'allClients', route: '/clients' },
            { title: 'addNew', route: '/clients/add' },
            { title: 'clone', route: '/clients/clone' },
            { title: 'configuration', route: '/clients/configuration/parameters' },
            { title: 'logs', route: '/clients/logs' },
          ],
        },
        {
          title: 'products',
          route: '/products',
          icon: icons.product,
        },
        {
          title: 'groups',
          route: '/groups',
          icon: icons.group,
        },
      ],
      [
        {
          title: 'support',
          route: '/support',
          icon: icons.support,
        },
      ],
    ]
    return rawGroups.map((group) => filterNavItems(group)).filter((group) => group.length > 0)
  })

  onMounted(() => {
    navGroups.value.flat().forEach((item) => {
      if (item.submenu && isActive(item.route)) {
        expanded.value[item.route] = true
      }
    })
  })

  watch(
    () => $route.path,
    () => {
      navGroups.value.flat().forEach((item) => {
        if (item.submenu && isActive(item.route)) {
          expanded.value[item.route] = true
        }
      })
    }
  )

  function isActive(route: string): boolean {
    return $route.path.startsWith(route)
  }

  function isSubActive(subRoute: string, submenu: { route: string }[]): boolean {
    const path = $route.path
    if (path === subRoute) return true
    if (!path.startsWith(subRoute + '/')) return false
    // Among sibling sub-routes that match the current path, only the longest prefix wins.
    const longest = submenu
      .map((s) => s.route)
      .filter((r) => path === r || path.startsWith(r + '/'))
      .reduce((a, b) => (b.length > a.length ? b : a), '')
    return longest === subRoute
  }

  function toggleSubmenu(route: string) {
    expanded.value[route] = !expanded.value[route]
  }

  function onHover(route: string, event?: MouseEvent | FocusEvent) {
    if (hoverTimeout) clearTimeout(hoverTimeout)
    hoveredItem.value = route
    if (event) {
      const target = event.currentTarget as HTMLElement
      const rect = target.getBoundingClientRect()
      itemPositions.value[route] = {
        top: rect.top,
        left: rect.right + 4,
      }
    }
  }

  function keepPopupOpen(route: string) {
    if (hoverTimeout) clearTimeout(hoverTimeout)
    hoveredItem.value = route
  }

  function onLeave() {
    hoverTimeout = setTimeout(() => {
      hoveredItem.value = null
    }, 200)
  }
</script>
