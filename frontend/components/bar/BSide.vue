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

  <el-menu router :collapse="isCollapse">
    <span v-for="item in navItems" :key="item.title">
      <template v-if="item.submenu">
        <el-sub-menu :index="item.route" :to="item.route">
          <template #title>
            <span>{{ $t(item.title) }}</span>
          </template>
          <span v-for="sub in item.submenu" :key="sub.title" :to="item.route">
            <el-menu-item :index="sub.route">
              <span>{{ $t(sub.title) }}</span>
            </el-menu-item>
          </span>
        </el-sub-menu>
      </template>
      <template v-else>
        <el-menu-item :index="item.route" :to="item.route">
          <span>{{ $t(item.title) }}</span>
        </el-menu-item>
      </template>
    </span>

    <el-checkbox-button v-model="isCollapse">
      {{ isCollapse ? 'Expand' : 'Collapse' }}
    </el-checkbox-button>
  </el-menu>
</template>

<script setup lang="ts">
const mq = useMQ()
const isCollapse = ref(false)
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
