<template>
  <el-menu mode="horizontal" :ellipsis="false" class="bg-opsi-blue" data-testid="BTop">
    <el-menu-item v-if="mq.isMobile.value" index="0" @click="toggleLeft" data-testid="menu_routes" class="min-w-14 w-14">
      <IconIIcon :icon="icons.navmenu" />
    </el-menu-item>

    <div v-if="mq.isMobile.value" class="flex-grow" />
    <el-menu-item index="1" @click="navigateToClients" class="!bg-transparent !hover:!bg-transparent">
      <IconIOpsiLogo class="opsi-logo" />
    </el-menu-item>

    <div class="flex-grow" />

    <el-menu-item v-if="changesExists"  @click="() => {changesDialogVisible = !changesDialogVisible}" index="2" type="text" data-testid="menu-changes" class="!bg-transparent">
      <ModalMChanges v-if="$mq!=='mobile'" v-model="changes" v-model:visible="changesDialogVisible" small transparent/>
    </el-menu-item>

    <el-menu-item index="3" type="text" @click="toggleRight" data-testid="menu-quickpanel" class="!bg-transparent">
      <IconIIcon :icon="icons.quickpanel" class="text-white" />
    </el-menu-item>

    <PopconfirmPLogout v-if="!mq.isMobile.value" index="4" :is-menu-item="true" />
  </el-menu>
</template>

<script setup lang="ts">
  import { useIcons } from '~/composables/mixins/useIcons'
  import { useRouter } from 'vue-router'

  const mq = useMQ()
  const $mq = useMQ().$mq
  const emit = defineEmits(['toggleLeft', 'toggleRight'])
  const icons = useIcons()
  const router = useRouter()
  const changesDialogVisible = ref(false)
  const toggleLeft = () => emit('toggleLeft')
  const toggleRight = () => emit('toggleRight')
  const navigateToClients = () => router.push('/clients/')

  const changes = storeChanges()

const changesExists = computed(() => {
  return changes?.changesHostParam?.length > 0 || changes?.changesProducts?.length > 0
})
</script>

<style scoped>
  .opsi-logo {
    height: 40px;
  }
</style>
