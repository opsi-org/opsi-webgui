<template>
  <div
    :class="{
      'is-mobile': mq.isMobile.value,
      'is-not-mobile': !mq.isMobile.value,
    }"
  >
    <el-container class="h-screen w-screen">
      <el-header class="max-h-12 min-w-screen bg-opsi-blue">
        <BarBTop
          class="max-h-full max-w-full"
          @toggle-left="() => toggleSide('left')"
          @toggle-right="() => toggleSide('right')"
        />
      </el-header>
      <el-container
        class="h-screen max-h-screen overflow-hidden"
        :class="{
          'left-collapsed': !mq.isMobile.value && leftSideIsSmall,
          'left-opened': !mq.isMobile.value && !leftSideIsSmall,
          'right-opened': !mq.isMobile.value && rightSideVisible,
        }"
      >
        <!-- LEFT SIDE -->
        <el-aside
          v-if="!mq.isMobile.value || leftSideVisible"
          :class="[
            'el-aside-left bg-opsi-blue',
            { 'absolute z-20 grid w-screen': mq.isMobile.value },
          ]"
        >
          <el-scrollbar
            :class="{
              'max-w-full': true,
              'w-16': !mq.isMobile.value && leftSideIsSmall,
              'z-40 opacity-100': mq.isMobile.value,
            }"
          >
            <BarBSide @change-small="setLeftCollapse" />
          </el-scrollbar>
        </el-aside>

        <!-- MAIN CONTENT -->
        <el-main class="z-0 p-2">
          <BreadcrumbBPageNavigation />
          <slot />
          <!-- <el-scrollbar class="!h-auto">
          </el-scrollbar> -->
        </el-main>

        <!-- RIGHT SIDE -->
        <el-aside
          v-if="rightSideVisible"
          style="box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1)"
          :class="[
            'el-aside-right p-1',
            {
              'fixed right-0 bg-general z-50 overflow-y-auto backdrop-blur-lg':
                mq.isMobile.value,
            },
          ]"
        >
          <el-scrollbar
            :class="{
              'w-full max-w-full right-0 opacity-100 justify-self-end !border-none p-2': true,
              'max-w-full z-30': mq.isMobile.value,
            }"
          >
            <BarBQuickPanel />
          </el-scrollbar>
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
  import { useNotification } from '~/composables/mixins/useComponent'
  import type { T_DisaledFeatures, T_configuration } from '~/types/APItypes'

  const { notifyError } = useNotification()
  const $t = useI18n().t
  const mq = useMQ()

  const settings = storeSettings()
  const configapp = storeConfigapp()

  const leftSideIsSmall = ref<boolean>(false)
  const leftSideVisible = ref<boolean>(!mq.isMobile.value)
  const rightSideVisible = ref<boolean>(!mq.isMobile.value)

  // init
  await checkConfig()
  settings.initColormode()
  leftSideIsSmall.value = settings.menuCollapsed && !mq.isMobile.value
  rightSideVisible.value = settings.quickpanelOpened && !mq.isMobile.value

  watch(
    () => mq.$mq.value,
    () => {
      settings.setIsMobile(mq.$mq.value === 'mobile')
      leftSideVisible.value = settings.menuCollapsed && !mq.isMobile.value
      rightSideVisible.value = settings.quickpanelOpened && !mq.isMobile.value
    },
  )

  watch(useRouter().currentRoute, () => {
    if (mq.isMobile.value && leftSideVisible.value) {
      toggleSide('left')
    }
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

  async function checkConfig() {
    const result = await useApiGET<T_configuration>('/user/configuration')
    if (result.error) {
      console.error(result.error)
      notifyError({ title: $t('message.error.fetch'), message: result.error })
      return
    } else if (!result.data.value) {
      console.error('No data in response')
      notifyError({
        title: $t('message.error.fetch'),
        message: 'No data in response',
      })
      return
    }
    const forbidden = await useApiGET<T_DisaledFeatures>(
      '/opsidata/server/disabled-features',
    )
    if (forbidden.error) {
      console.error(forbidden.error)
      notifyError({
        title: $t('message.error.fetch'),
        message: forbidden.error,
      })
      return
    } else if (!forbidden.data.value) {
      console.error('No data in response')
      notifyError({
        title: $t('message.error.fetch'),
        message: 'No data in response',
      })
      return
    }

    const _config: { [key: string]: boolean } = {
      ...result.data.value.configuration,
    }
    forbidden.data.value.forEach((forbElem: string) => {
      _config[forbElem + '.forbidden'] = true
    })
    configapp.setConfig(_config)
  }
</script>

<style scoped>
  :root {
    --minus-height: 1px;
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
    --minus-height: 10%;
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
