<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div
    :class="{
      'is-mobile': mq.isMobile.value,
      'is-not-mobile': !mq.isMobile.value,
    }"
  >
    <el-container class="h-screen w-screen">
      <el-header id="btop-header" class="max-h-12 min-w-screen bg-opsi-blue">
        <BarBTop
          class="max-h-full max-w-full"
          @toggle-left="() => toggleSide('left')"
          @toggle-right="() => toggleSide('right')"
        />
      </el-header>
      <el-container
        class="h-screen max-h-screen overflow-hidden"
        :class="{
          'left-collapsed': leftSideIsSmall,
          'left-opened': !leftSideIsSmall,
          'right-opened': rightSideVisible,
        }"
      >
        <!-- LEFT SIDE -->
        <el-aside
          v-if="!mq.isMobile.value || leftSideVisible"
          @click="(e: any) => (e.target === e.currentTarget ? toggleSide('left') : null)"
          :class="[
            mq.isMobile.value
              ? 'absolute z-40 grid !h-[calc(100vh-3rem)] !min-w-screen opacity-96'
              : 'el-aside-left bg-opsi-blue',

            mq.isMobile.value && isDarkMode ? 'bg-opsi-gray' : 'bg-opsi-base-light-background',
          ]"
        >
          <el-scrollbar
            :class="{
              'max-w-full': true,
              'el-aside el-aside-left z-20 !opacity-100': mq.isMobile.value,
            }"
          >
            <BarBSide @change-small="setLeftCollapse" />
          </el-scrollbar>
        </el-aside>

        <!-- MAIN CONTENT -->
        <el-main class="z-0 p-2" data-testid="page-main-content">
          <BreadcrumbBPageNavigation />
          <slot />
        </el-main>

        <!-- RIGHT SIDE -->
        <el-aside
          v-if="rightSideVisible"
          style="box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1)"
          :class="[
            '',
            mq.isMobile.value
              ? 'fixed right-0 bg-general z-50 overflow-y-auto backdrop-blur-lg min-h-[calc(100vh-3rem)] !opacity-96 '
              : 'el-side-right max-w-80',
            // mq.isMobile.value && isDarkMode
            isDarkMode
              ? mq.isMobile.value
                ? 'bg-opsi-gray'
                : 'bg-transparent'
              : 'bg-opsi-base-light-background',
          ]"
        >
          <el-scrollbar
            :class="[
              'w-full max-w-full right-0 justify-self-end !border-none p-2 ',
              mq.isMobile.value ? '!max-w-[80vw] z-30 min-h-[calc(100vh-3rem)]' : '',
            ]"
          >
            <BarBQuickPanel />
          </el-scrollbar>
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
  import { useTimer } from '~/composables/mixins/useCounter'

  useTimer(true) // timer for session expiry (showed in quickpanel, but initialized here)
  const mq = useMQ()

  const configapp = storeConfigapp()
  const settings = storeSettings()
  const { isLight } = storeToRefs(storeSettings())
  settings.initLanguage()

  const leftSideIsSmall = ref<boolean>(settings.menuCollapsed && !mq.isMobile.value)
  const leftSideVisible = ref<boolean>(!mq.isMobile.value)
  const rightSideVisible = ref<boolean>(settings.quickpanelOpened && !mq.isMobile.value)

  // init
  onMounted(async () => {
    settings.initColormode()
    settings.initLanguage()
    // check if user is logged in
    await configapp.initConfig()
    leftSideIsSmall.value = settings.menuCollapsed && !mq.isMobile.value
    rightSideVisible.value = settings.quickpanelOpened && !mq.isMobile.value
  })

  watch(
    () => mq.$mq.value,
    () => {
      settings.setIsMobile(mq.$mq.value === 'mobile')
      leftSideVisible.value = !mq.isMobile.value
      leftSideIsSmall.value = settings.menuCollapsed && !mq.isMobile.value
      rightSideVisible.value = settings.quickpanelOpened && !mq.isMobile.value
    }
  )

  watch(useRouter().currentRoute, () => {
    if (mq.isMobile.value && leftSideVisible.value) {
      toggleSide('left')
    }
  })

  const isDarkMode = computed({
    get: () => !isLight.value,
    // get: () => settings.colormode === 'dark',
    set: (value: boolean) => {
      settings.setColormode(value ? 'dark' : 'light')
    },
  })

  function setLeftCollapse(v: boolean) {
    leftSideIsSmall.value = v
    if (!mq.isMobile.value && leftSideVisible.value) {
      settings.setMenuCollapsed(v)
    }
  }

  function toggleSide(side: 'left' | 'right') {
    const isLeft = side === 'left'
    leftSideVisible.value = isLeft ? !leftSideVisible.value : false
    rightSideVisible.value = isLeft ? false : !rightSideVisible.value

    if (!isLeft) {
      settings.setQuickpanelOpened(rightSideVisible.value)
    }
  }
</script>

<style scoped>
  :root {
    --minus-height: 1px;
    --width: 0px;
  }
  .el-main {
    --el-main-padding: 7px;
  }
  .el-aside {
    width: calc(var(--width, 100%) - var(--minus-width, 0px));
    height: calc(100% - var(--minus-height));
  }

  .el-aside-left {
    --width: 150px;
  }

  .el-aside-right {
    --width: 285px;
  }

  .is-mobile .el-aside {
    --minus-height: 0%;
  }

  .is-mobile .el-aside-left {
    --width: 70%;
  }

  .is-mobile .el-aside-right {
    --width: 100%;
  }

  .is-not-mobile .left-opened .el-aside-left {
    --width: 250px;
  }

  .is-not-mobile .left-collapsed .el-aside-left {
    --width: 65px;
  }

  .left-opened:not(.right-opened) .el-main {
    --minus-width: 250px;
  }

  .left-opened.right-opened .el-main {
    --minus-width: 545px;
  }

  .left-collapsed.right-opened .el-main {
    --minus-width: 350px;
  }

  .left-collapsed:not(.right-opened) .el-main {
    --minus-width: 70px;
  }
</style>
