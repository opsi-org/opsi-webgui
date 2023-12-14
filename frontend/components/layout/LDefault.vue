<template>
  <div :class="{
    [`webgui-theme-${color}`]: true,
    'is-mobile': settings.isMobile
  }" >
    <el-container class="h-screen w-screen">
      <el-header class="min-w-screen max-h-10 p-0">
        <BarBTop
          class="max-h-full max-w-full"
          @toggle-left="()=>leftSideVisible = !leftSideVisible"
          @toggle-right="()=>rightSideVisible = !rightSideVisible"
        />
      </el-header>

      <el-container class="h-screen max-h-screen overflow-hidden">
        <!-- initially set correct colorTheme -->
        <div class="hidden"><TestTheme/></div>

        <el-aside
          v-if="!settings.isMobile || leftSideVisible"
          class=""
          :class="{
            // 'w-60': !settings.isMobile && !leftSideIsSmall,
            // 'w-16': !settings.isMobile && leftSideIsSmall,
            'absolute z-20 grid border-1 w-screen border-black': settings.isMobile
            }"
        >
          <div
            :class="{
              'hidden': !settings.isMobile,
              'absolute bg-color opacity-70 z-10 border-1 border-blue-500 w-screen h-full': settings.isMobile
              }"
            @click.self="()=>{
              leftSideVisible = !leftSideVisible
              rightSideVisible = false
            }"
          ></div>
          <el-scrollbar :class="{
            'border-green-500 border-solid border-2': true,
            'w-48': !settings.isMobile && !leftSideIsSmall,
            'w-16': !settings.isMobile && leftSideIsSmall,
            'w-2/3 max-w-full z-40 bg-color opacity-100': settings.isMobile,
          }">
            <BarBSide @change-small="(v) => leftSideIsSmall = v"/>
          </el-scrollbar>
        </el-aside>

        <el-main class="w-screen z-0">
          <el-scrollbar>
            <slot />
          </el-scrollbar>
        </el-main>




        <el-aside
          v-if="rightSideVisible || !settings.isMobile"
          :class="{
            'w-60': !settings.isMobile,
            'absolute right-0 z-20 w-screen max-w-screen grid': settings.isMobile
            }"
        >
          <div
            :class="{
              'hidden': !settings.isMobile,
              'absolute bg-color left-0 opacity-70 z-30 border-1 border-red-500 w-screen h-screen max-w-screen': settings.isMobile
            }"
            @click.self="()=>{
              rightSideVisible = !rightSideVisible
              leftSideVisible = false
            }"
          ></div>
          <el-scrollbar :class="{
            'right-0 opacity-100 justify-self-end border-blue-500 border-solid border-2': true,
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
const leftSideIsSmall = ref<boolean>(false)
const leftSideVisible = ref<boolean>(!settings.isMobile)
const rightSideVisible = ref<boolean>(!settings.isMobile)
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
  --height: calc(100% - 40px);
  min-height: var(--height);
  height: var(--height);
  max-height: var(--height);
}
.is-mobile .el-aside {
  width: 100vw !important;
}
:not(.is-mobile) .el-aside {
  width: fit-content;
}
.el-main {
  padding: 0;
}
</style>