<template>
  <el-container>
    <el-header>
      <BarBTop @toggle-left="toggleSide('left')" @toggle-right="toggleSide('right')" />
    </el-header>
    <el-container>
      <el-aside v-if="leftSideVisible" class="el-aside-left"
      :class="{
        'aside-left-collapsed': !mq.isMobile.value && leftSideIsSmall,
        'position-absolute z-[99999] min-w-[70%] min-h-calc-100vh-60px': mq.isMobile.value
       }"
      >
        <el-scrollbar>
          <BarBSide @change-small="setLeftCollapse"/>
        </el-scrollbar>
      </el-aside>

      <el-main :class="{ 'main-content': true }">
        <el-scrollbar>
          <BreadcrumbBPageNavigation />
          <slot />
        </el-scrollbar>

        <!-- backdrop for mobile view-->
        <div
          v-if="mq.isMobile.value && (leftSideVisible || rightSideVisible)"
          class="bg-black opacity-50 w-screen min-h-screen position-absolute top-0 z-index-[88888] -ml-5 mt-[60px]"
          @click="closeOpenedSide()"
        />
      </el-main>

      <el-aside v-if="rightSideVisible" :class="{
        'el-side-right': true,
        'position-absolute right-0 z-[99999] min-w-[70%] min-h-calc-100vh-60px': mq.isMobile.value
      }">
        <el-scrollbar class="quickpanel">
          <BarBQuickPanel />
        </el-scrollbar>
      </el-aside>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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

onMounted(async ()=>{
  await checkConfig()
  settings.initColormode()
  leftSideIsSmall.value = settings.menuCollapsed && !mq.isMobile.value
  rightSideVisible.value = settings.quickpanelOpened && !mq.isMobile.value
})

function setLeftCollapse (v: boolean) {
  leftSideIsSmall.value = v
  settings.setMenuCollapsed(v)
}
function closeOpenedSide() {
  leftSideVisible.value = false
  rightSideVisible.value = false
  settings.setQuickpanelOpened(false)
}
function toggleSide (side: string) {
  if (side === 'left') {
    if (mq.isMobile.value) { rightSideVisible.value = false }
    leftSideVisible.value = !leftSideVisible.value
  } else if (side === 'right') {
    if (mq.isMobile.value) { leftSideVisible.value = false }
    rightSideVisible.value = !rightSideVisible.value
    settings.setQuickpanelOpened(rightSideVisible.value)
  }
}

async function checkConfig () {
  const result = await useApiGET<T_configuration>('/user/configuration')
  if (result.error) {
    console.error(result.error)
    notifyError({ title: $t('message.error.fetch'), message: result.error })
    return
  }
  const forbidden = await useApiGET<T_DisaledFeatures>('/opsidata/server/disabled-features')
  if (forbidden.error) {
    console.error(forbidden.error)
    notifyError({ title: $t('message.error.fetch'), message: forbidden.error })
    return
  }
  const _config = { ...(result.data.value?.configuration ?? {}) }
  forbidden.data.value?.forEach((forbElem:string) => {
    _config[forbElem + '.forbidden'] = true
  })
  configapp.setConfig(_config)
}
</script>

<style scoped>
.min-h-calc-100vh-60px {
  min-height: calc(100vh - 60px);
}
.el-header {
  background-color: var(--opsi-general-blue);
}

.main-content {
  border-right: 1px solid var(--el-border-color);
}

.el-aside {
  background-color: var(--opsi-general-blue);
}

.el-aside-left {
  width: 170px;
}

.aside-left-collapsed {
  width: 70px;
}

.el-aside-right {
  width: 285px;
}

.quickpanel {
  background-color: var(--bg-color) !important;
  color: var(--fg-color) !important;
  padding: 5px;
}
</style>