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
  <el-row class="tac">
    <el-col :span="12">
      <el-menu
        default-active="2"
        class="el-menu-vertical-demo"
      >
        <el-sub-menu index="1">
          <template #title>
            <el-icon><location /></el-icon>
            <span>Navigator One</span>
          </template>
          <el-menu-item-group title="Group One">
            <el-menu-item index="1-1">item one</el-menu-item>
            <el-menu-item index="1-2">item two</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group title="Group Two">
            <el-menu-item index="1-3">item three</el-menu-item>
          </el-menu-item-group>
          <el-sub-menu index="1-4">
            <template #title>item four</template>
            <el-menu-item index="1-4-1">item one</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>
        <el-menu-item index="2">
          <el-icon><icon-menu /></el-icon>
          <span>Navigator Two</span>
        </el-menu-item>
        <el-menu-item index="3" disabled>
          <el-icon><document /></el-icon>
          <span>Navigator Three</span>
        </el-menu-item>
        <el-menu-item index="4">
          <el-icon><setting /></el-icon>
          <span>Navigator Four</span>
        </el-menu-item>
      </el-menu>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
const mq = useMQ()

const navItems = [
  {
    title: 'title.depots', route: '/depots/',
    submenu: [
      { title: 'title.allDepots', route: '/depots/' },
      { title: 'title.config', route: '/depotsconfig' }
    ]
  },
  {
    title: 'title.clients', route: '/clients/',
    submenu: [
      { title: 'title.allClients', route: '/clients/' },
      { title: 'title.addNew', route: '/clientscreation' },
      { title: 'title.config', route: '/clientsconfig' },
      { title: 'title.log', route: '/clientslog' }
    ]
  },
  { title: 'title.products', route: '/products/' },
  { title: 'title.groups', route: '/groups/' }
]
</script>

<style scoped>
#sidemenu {
  top: calc(var(--height-navbar) - 2px) !important;
  width: 200px;
  height: 100% !important;
}
</style>
