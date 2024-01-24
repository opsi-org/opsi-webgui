<template>
 <el-menu v-if="useMQ().isMobile.value" mode="horizontal" class="border-0"
  data-testid="BTop"
    :ellipsis="false">
    <el-menu-item index="0" @click="()=>emit('toggleLeft')" data-testid="menu_routes">
      <IconIIcon :icon="icons.navmenu" class="text-on-primary"/>
    </el-menu-item>

    <div class="flex-grow" />
    <el-menu-item index="1" @click="useRouter().push('/clients/')">
      <IconIOpsiLogo class="max-h-full h-full" />
    </el-menu-item>

    <div class="flex-grow" />

    <!-- <el-menu-item index="2">
    </el-menu-item> -->

    <!-- <el-sub-menu index="2"
      class="grid"
    > -->

      <el-menu-item index="2" type="text" @click="()=>emit('toggleRight')" data-testid="menu-quickpanel">
        <IconIIcon :icon="icons.quickpanel" class="text-on-primary"/>
        <!-- <div class="flex-grow" /> -->
        <!-- <p class="ml-1">QuickPanel</p> -->
      </el-menu-item>

      <!-- <ButtonBTNLogout index="3" :is-menu-item="true"/> -->
      <!-- <IconIIcon :icon="icons.menu" /> -->
    <!-- </el-sub-menu> -->
  </el-menu>

 <el-menu v-else mode="horizontal" :ellipsis="false" class="text-on-primary"
  data-testid="BTop">
    <el-menu-item index="0" @click="useRouter().push('/clients/')">
      <IconIOpsiLogo class="max-h-full h-full"/>
    </el-menu-item>

    <div class="flex-grow" />

    <el-menu-item index="1" type="text" @click="()=>emit('toggleRight')" data-testid="menu-quickpanel">
      <IconIIcon :icon="icons.quickpanel" class="text-on-primary"/>
    </el-menu-item>
    <ButtonBTNLogout index="2" :is-menu-item="true"/>
  </el-menu>
</template>

<script setup lang="ts">
import { useIcons } from '~/composables/mixins/useIcons';

const emit = defineEmits(['toggleLeft', 'toggleRight'])
const settings = storeSettings()
const icons = useIcons()
</script>

<style scoped>
.el-menu-item,
.el-menu-item.is-active {
  color: var(--fg-color) !important;
}
</style>
