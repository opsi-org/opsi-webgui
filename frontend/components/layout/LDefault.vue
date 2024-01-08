<template>
  <div :class="{
    'is-mobile': settings.isMobile
  }" >
  <!-- [`webgui-theme-${colormode}`]: true, -->
    <el-container class="h-screen w-screen">
      <el-header class="min-w-screen max-h-10 p-0">
        <BarBTop
          class="max-h-full max-w-full"
          @toggle-left="()=>toggleSide('left')"
          @toggle-right="()=>toggleSide('right')"
        />
      </el-header>

      <el-container class="h-screen max-h-screen overflow-hidden">
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
            ' border-0 border-r': true,
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
            'right-0 opacity-100 justify-self-end border-0': true,
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
import { useNotification } from '~/composables/mixins/useComponent';

// const color = useColorMode();

const settings = storeSettings()
// const { colormode } = storeToRefs(settings)
const configapp = storeConfigapp()
const { config } = storeToRefs(configapp)
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

onMounted(async ()=>{
  settings.initColormode()
  await checkConfig()

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

async function checkConfig () {
  const config = await useApiGET('/user/configuration')
  if (config.error) {
    console.log(config.error)
    useNotification().error(config.error)
    return
  }
  const forbidden = await useApiGET('/opsidata/server/disabled-features')
  if (forbidden.error) {
    console.log(forbidden.error)
    useNotification().error(forbidden.error)
    return
  }
  const _config = { ...config.data.value.configuration }
  console.log('forbidden', forbidden.data.value)
  forbidden.data.value.forEach((forbElem:string) => {
    _config[forbElem + '.forbidden'] = true
  })
  configapp.setConfig(_config)

  //   try {
  //     const response = (await this.$axios.$get('/api/user/configuration')).configuration
  //     const forbiddenList = (await this.$axios.get('/api/opsidata/server/disabled-features')).data
  //     const _config = { ...response }
  //     forbiddenList.forEach((forbElem:string) => {
  //       _config[forbElem + '.forbidden'] = true
  //     })
  //     this.setConfig(_config)
  //   } catch (error: any) {
  //     const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
  //     const ref = (this.$refs.errorAlert as any)
  //     ref.alert(detailedError, 'danger')
  //   }
  // }
}
</script>


<style scoped>

.bg-color {
  background-color: var(--bg-color) !important;
  color: var(--fg-color) !important;
}
.el-header {
  position: relative;
  height: calc(var(--el-header-height) + 1px);
  background-color: var(--opsi-general-blue);
  --el-color: green;
}
.el-aside {
  --height: calc(100% - 0px);
  min-height: var(--height);
  height: var(--height);
  max-height: var(--height);

  background-color: var(--opsi-general-blue);
  border: 0px;
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