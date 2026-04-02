Sidebar component - main navigation.
<template>
    <nav class="h-full flex flex-col bg-opsi-blue text-white">
        <div :class="['flex-1 py-2', collapsed ? 'overflow-visible' : 'overflow-y-auto']">
            <template v-for="(group, groupIdx) in navGroups" :key="groupIdx">
                <div v-for="item in group" :key="item.route" class="relative mx-1.5"
                    @mouseenter="onHover(item.route, $event)" @mouseleave="onLeave">
                    <template v-if="item.submenu">
                        <template v-if="!collapsed">
                            <button @click="toggleSubmenu(item.route)"
                                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/15 transition-colors duration-100"
                                :class="{ 'bg-white/10': isActive(item.route) && !expanded[item.route] }">
                                <UIcon :name="item.icon" class="w-5 h-5 shrink-0" />
                                <span class="flex-1 text-sm text-left">{{ t(item.title) }}</span>
                                <UIcon :name="expanded[item.route] ? icons.chevronUp : icons.chevronDown"
                                    class="w-4 h-4 transition-transform" />
                            </button>
                            <div v-if="expanded[item.route]" class="ml-4 mt-0.5 mb-1 border-l-2 border-white/20 pl-2">
                                <NuxtLink v-for="sub in item.submenu" :key="sub.route" :to="sub.route"
                                    class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-100 text-white/80 hover:text-white hover:bg-white/15"
                                    :class="{ 'bg-white/25 text-white font-medium': $route.path === sub.route }">
                                    {{ t(sub.title) }}
                                </NuxtLink>
                            </div>
                        </template>

                        <template v-else>
                            <NuxtLink :to="item.submenu[0]?.route || item.route"
                                class="flex items-center justify-center py-3 rounded-lg hover:bg-white/15 transition-colors duration-100"
                                :class="{ 'bg-white/10': isActive(item.route) }" :title="t(item.title)">
                                <UIcon :name="item.icon" class="w-5 h-5" />
                            </NuxtLink>
                            <Teleport to="body">
                                <div v-if="hoveredItem === item.route" :style="getPopupPosition(item.route)"
                                    @mouseenter="keepPopupOpen(item.route)" @mouseleave="onLeave"
                                    class="fixed bg-opsi-blue rounded-xl shadow-lg min-w-44 py-1 z-100 border border-white/10">
                                    <div class="px-3 py-2 text-xs font-semibold text-white/70 border-b border-white/10">
                                        {{ t(item.title) }}
                                    </div>
                                    <NuxtLink v-for="sub in item.submenu" :key="sub.route" :to="sub.route"
                                        @click="hoveredItem = null"
                                        class="flex items-center px-3 py-2 rounded-lg mx-1 my-0.5 text-sm text-white/80 hover:text-white hover:bg-white/15 transition-colors duration-100"
                                        :class="{ 'bg-white/25 text-white': $route.path === sub.route }">
                                        {{ t(sub.title) }}
                                    </NuxtLink>
                                </div>
                            </Teleport>
                        </template>
                    </template>

                    <template v-else>
                        <NuxtLink :to="item.route"
                            class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/15 transition-colors duration-100"
                            :class="[
                                { 'bg-white/25 font-medium': $route.path === item.route },
                                { 'bg-white/10': isActive(item.route) && $route.path !== item.route },
                                collapsed ? 'justify-center' : ''
                            ]" :title="collapsed ? t(item.title) : undefined">
                            <UIcon :name="item.icon" class="w-5 h-5 shrink-0" />
                            <span v-if="!collapsed" class="text-sm">{{ t(item.title) }}</span>
                        </NuxtLink>
                    </template>
                </div>
                <div v-if="groupIdx < navGroups.length - 1" class="my-10"></div>
            </template>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/userStore'

defineProps<{
    collapsed: boolean
    isMobile: boolean
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const $route = useRoute()
const userStore = useUserStore()
const { filterNavItems, isPageAccessible } = useFeatureFlags()

const expanded = ref<Record<string, boolean>>({})
const hoveredItem = ref<string | null>(null)
const itemPositions = ref<Record<string, { top: number; left: number }>>({})
let hoverTimeout: ReturnType<typeof setTimeout> | null = null

const t = (key: string) => {
    const translated = $t(key)
    if (translated && translated !== key) return String(translated)
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

function getPopupPosition(route: string) {
    const pos = itemPositions.value[route]
    if (!pos) return { top: '0px', left: '0px' }
    return {
        top: `${pos.top}px`,
        left: `${pos.left}px`
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
    return rawGroups.map(group => filterNavItems(group)).filter(group => group.length > 0)
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

function toggleSubmenu(route: string) {
    expanded.value[route] = !expanded.value[route]
}

function onHover(route: string, event?: MouseEvent) {
    if (hoverTimeout) clearTimeout(hoverTimeout)
    hoveredItem.value = route
    if (event) {
        const target = event.currentTarget as HTMLElement
        const rect = target.getBoundingClientRect()
        itemPositions.value[route] = {
            top: rect.top,
            left: rect.right + 4
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