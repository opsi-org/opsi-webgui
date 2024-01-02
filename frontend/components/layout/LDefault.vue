<template>
  <div :class="{
    [`webgui-theme-${color}`]: true,
    'is-mobile': settings.isMobile
  }" >
    <el-container class="h-screen w-screen">
      <el-header class="min-w-screen max-h-10 p-0">
        <BarBTop
          class="max-h-full max-w-full"
          @toggle-left="()=>toggleSide('left')"
          @toggle-right="()=>toggleSide('right')"
        />
      </el-header>

      <el-container class="h-screen max-h-screen overflow-hidden">
        <!-- initially set correct colorTheme -->
        <div class="hidden"><TestTheme/></div>

        <el-aside
          v-if="!settings.isMobile || leftSideVisible"
          class=""
          :class="{
            'absolute z-20 grid w-screen': settings.isMobile
            }"
        >
          <div
            :class="{
              'hidden': !settings.isMobile,
              'absolute bg-color opacity-70 z-10 w-screen h-full': settings.isMobile
              }"
            @click.self="toggleSide('left')"
          ></div>
          <el-scrollbar :class="{
            'border-r': true,
            'w-48': !settings.isMobile && !leftSideIsSmall,
            'w-16': !settings.isMobile && leftSideIsSmall,
            'w-2/3 max-w-full z-40 bg-color opacity-100': settings.isMobile,
          }">
            <BarBSide @change-small="setLeftCollapse"/>
          </el-scrollbar>
        </el-aside>

        <el-main class="w-screen z-0">
          <el-scrollbar>
            <slot />
          </el-scrollbar>
        </el-main>




        <el-aside
          v-if="rightSideVisible"
          :class="{
            'w-60': !settings.isMobile,
            'absolute right-0 z-20 grid': settings.isMobile
            }"
        >
          <div
            :class="{
              'hidden': !settings.isMobile,
              'absolute bg-color left-0 opacity-70 z-30 w-screen h-screen max-w-screen': settings.isMobile
            }"
            @click.self="toggleSide('right')"
          ></div>
          <el-scrollbar :class="{
            'right-0 opacity-100 justify-self-end border-1': true,
            'w-80': !settings.isMobile,
            'max-w-full bg-color z-30': settings.isMobile,
            }">
            <BarBQuickPanel />
          </el-scrollbar>
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
const color = useColorMode();
const settings = storeSettings()
const { isMobile } = storeToRefs(settings)
const leftSideIsSmall = ref<boolean>(false)
const leftSideVisible = ref<boolean>(!isMobile)
const rightSideVisible = ref<boolean>(!isMobile)
const mq = useMQ()
// const cache = storeCache()
// const { opsiconfigserver } = storeToRefs(cache)
watch(()=> mq.$mq.value, (newVal, oldVal) => {
  console.log('mq changed', newVal)
  if (mq.$mq.value === 'mobile') {
    settings.setIsMobile(true)
  } else {
    settings.setIsMobile(false)
  }
})

onMounted(()=>{
  leftSideIsSmall.value = false
  if (settings.menuCollapsed) {
    leftSideIsSmall.value = true
  }

  rightSideVisible.value = false
  if (settings.quickpanelOpened) {
    rightSideVisible.value = true
  }
})
const setLeftCollapse = (v: boolean) => {
  leftSideIsSmall.value = v
  settings.setMenuCollapsed(v)
  // (v: any) => leftSideIsSmall = v
}
const toggleSide = async (side: string) => {
  if (side === 'left') {
    rightSideVisible.value = false
    leftSideVisible.value = !leftSideVisible.value
  } else if (side === 'right') {
    leftSideVisible.value = false
    rightSideVisible.value = !rightSideVisible.value
    settings.setQuickpanelOpened(rightSideVisible.value)
  }
}
</script>


<style scoped>
.bg-color {
  background-color: var(--bg-color) !important;
  color: var(--fg-color) !important;
}
.el-header {
  position: relative;
}
.el-aside {
  --height: calc(100% - 0px);
  min-height: var(--height);
  height: var(--height);
  max-height: var(--height);
}
.is-mobile .el-aside {
  --height: calc(100% - 40px);
  min-height: var(--height);
  height: var(--height);
  max-height: var(--height);

  width: 100vw !important;
}
:not(.is-mobile) .el-aside {
  width: fit-content;
}
.el-main {
  padding: 0;
}
.border-r{
  border-color: var(--el-border-color)
}
</style>