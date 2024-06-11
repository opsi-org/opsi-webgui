
<template>
  <el-menu mode="horizontal" :ellipsis="false" class="border-0 text-on-primary" data-testid="BTop">
    <el-menu-item v-if="mq.isMobile.value" index="0" @click="toggleLeft" data-testid="menu_routes" class="min-w-14 w-14">
      <IconIIcon :icon="icons.navmenu" class="text-on-primary"/>
    </el-menu-item>

    <div v-if="mq.isMobile.value" class="flex-grow" />
    <!--  -->
    <el-menu-item index="1" @click="navigateToClients"  class="!bg-transparent !hover:!bg-transparent">
      <IconIOpsiLogo class="opsi-logo" />
    </el-menu-item>

    <div class="flex-grow" />

    <el-menu-item index="2" type="text" @click="toggleRight" data-testid="menu-quickpanel" class="min-w-14 w-14">
      <IconIIcon :icon="icons.quickpanel" class="text-on-primary"/>
    </el-menu-item>

    <PopconfirmPLogout v-if="!mq.isMobile.value" index="3" :is-menu-item="true"/>
  </el-menu>
</template>

<script setup lang="ts">
import { useIcons } from '~/composables/mixins/useIcons';
import { useRouter } from 'vue-router';

const mq = useMQ()
const emit = defineEmits(['toggleLeft', 'toggleRight'])
const icons = useIcons()
const router = useRouter()

const toggleLeft = () => emit('toggleLeft')
const toggleRight = () => emit('toggleRight')
const navigateToClients = () => router.push('/clients/')
</script>

<style scoped>
.el-menu-item,
.el-menu-item.is-active {
  color: var(--fg-color);
}
[data-testid="menu-quickpanel"].text-on-primary:hover .text-on-primary {
  --el-text-color-regular: var(--fg-color);
  color: var(--el-text-color-regular);
}
.opsi-logo {
  height: 40px;
}
</style>

