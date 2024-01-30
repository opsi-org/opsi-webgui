<template>
  <!-- <DevOnly>Hello</DevOnly> -->
  <div :class="{
    'is-mobile': mq.isMobile.value,
    'is-not-mobile': !mq.isMobile.value,
  }" >
  <!-- [`webgui-theme-${colormode}`]: true, -->
    <el-container class="h-screen w-screen">
      <el-header class="min-w-screen max-h-10 p-0 m-0 border-0">
        <BarBTop
          class="max-h-full max-w-full"
          @toggle-left="()=>toggleSide('left')"
          @toggle-right="()=>toggleSide('right')"
        />
      </el-header>
      <el-container
       class="h-screen max-h-screen overflow-hidden"
       :class="{
        // 'is-mobile': mq.isMobile.value,
        // 'is-not-mobile': !mq.isMobile.value,
        // 'leftVisible': leftSideVisible,
        // 'leftSmall': leftSideIsSmall,
        'left-collapsed': !mq.isMobile.value && leftSideIsSmall,
        'left-opened': !mq.isMobile.value && !leftSideIsSmall,
        'right-opened': !mq.isMobile.value && rightSideVisible,
       }"
      >
        <el-aside
          v-if="!mq.isMobile.value || leftSideVisible"
          class="el-aside-left"
          :class="{
            'absolute z-20 grid w-screen': mq.isMobile.value
            }"
        >
          <div
            :class="{
              'hidden': !mq.isMobile.value,
              'fixed bg-color opacity-70 z-10 w-screen h-full': mq.isMobile.value,
              }"
            @click.self="toggleSide('left')"
          ></div>
          <el-scrollbar
            style="border-right: 1px solid var(--el-border-color)"
            :class="{
            'border-0 border-r': true,
            // 'w-48': !mq.isMobile.value && !leftSideIsSmall,
            'max-w-full': true,
            'w-16': !mq.isMobile.value && leftSideIsSmall,
            ' z-40 bg-color opacity-100': mq.isMobile.value,
          }">
            <BarBSide @change-small="setLeftCollapse"/>
          </el-scrollbar>
        </el-aside>

        <el-main class="z-0 p-2">
          <el-scrollbar
            class="p-0 m-0"
            wrap-class="p-0 m-0"
            view-class="p-0 m-0"
          >
            <slot />
          </el-scrollbar>
        </el-main>




        <el-aside
          v-if="rightSideVisible"
          style="border-left: 1px solid var(--el-border-color)"
          class="border-l"
          :class="{
            'el-aside-right': true,
            'p-0 w-full': !mq.isMobile.value,
            'absolute right-0 z-20 grid': mq.isMobile.value
            }"
        >
          <div
            :class="{
              'hidden': !mq.isMobile.value,
              'fixed bg-color left-0 opacity-70 z-30 w-screen h-screen max-w-screen': mq.isMobile.value
            }"
            @click.self="toggleSide('right')"
          ></div>
          <el-scrollbar :class="{
            'w-full max-w-full right-0 opacity-100 justify-self-end bg-color border-0 p-2': true,
            // 'w-80': !mq.isMobile.value,
            'max-w-full z-30': mq.isMobile.value,
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
import type { T_DisaledFeatures, T_configuration } from '~/types/APItypes'

const mq = useMQ()
const settings = storeSettings()
const configapp = storeConfigapp()
const leftSideIsSmall = ref<boolean>(false)
const leftSideVisible = ref<boolean>(!mq.isMobile.value)
const rightSideVisible = ref<boolean>(!mq.isMobile.value)


watch(()=> mq.$mq.value, (newVal, oldVal) => {
  settings.setIsMobile(mq.$mq.value === 'mobile')
})

watch(useRouter().currentRoute, () => {
  if (mq.isMobile.value) { toggleSide('left') }
})


// onMounted(async ()=>{
await checkConfig()
settings.initColormode()

leftSideIsSmall.value = false
if (settings.menuCollapsed && !mq.isMobile.value) {
  leftSideIsSmall.value = true
}

rightSideVisible.value = false
if (settings.quickpanelOpened && !mq.isMobile.value) {
  rightSideVisible.value = true
}
// })

function setLeftCollapse (v: boolean) {
  leftSideIsSmall.value = v
  settings.setMenuCollapsed(v)
  // (v: any) => leftSideIsSmall = v
}
function toggleSide (side: string) {
  if (side === 'left') {
    rightSideVisible.value = false
    leftSideVisible.value = !leftSideVisible.value
  } else if (side === 'right') {
    leftSideVisible.value = false
    rightSideVisible.value = !rightSideVisible.value
    settings.setQuickpanelOpened(rightSideVisible.value)
  }
}

// interface ApiResConf { data: Ref<T_configuration>, error: string, headers: Headers }
// interface ApiResDF { data: Ref<Array<string>>, error: string, headers: Headers }
async function checkConfig () {
  const result = await useApiGET<T_configuration>('/user/configuration')
  if (result.error) {
    console.log(result.error)
    useNotification().error(result.error, 'Error fetching Configuration')
    return
  }
  const forbidden = await useApiGET<T_DisaledFeatures>('/opsidata/server/disabled-features')
  if (forbidden.error) {
    console.log(forbidden.error)
    useNotification().error(forbidden.error, 'Error fetching forbidden features')
    return
  }
  const _config = { ...result.data.value.configuration }
  console.log('forbidden', forbidden.data.value)
  forbidden.data.value.forEach((forbElem:string) => {
    _config[forbElem + '.forbidden'] = true
  })
  console.log('SET CONFIG TO', _config)
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
  /* background-color: var(--bg-color) !important; */
  /* color: var(--fg-color) !important; */

}
.el-header {
  position: relative;
  height: calc(var(--el-header-height) + 1px);
  background-color: var(--opsi-general-blue);
  --el-color: green;
}


.el-aside>.el-scrollbar {
  --width: 100%;
  max-width: var(--width);
  min-width: var(--width);
}
.el-aside {
  --height: 100%;
  --minus-height: 0px;
  min-height: calc(var(--height) - var(--minus-height));
  height: calc(var(--height) - var(--minus-height));
  max-height: calc(var(--height) - var(--minus-height));

  background-color: var(--opsi-general-blue);
  --width: 100%; /* fallback */
  --minus-width: 0px; /* fallback */
  width: calc(var(--width) - var(--minus-width));
  min-width: calc(var(--width) - var(--minus-width));
  max-width: calc(var(--width) - var(--minus-width));
}
.el-aside-left { /*mobile*/
  --width: 200px;
}


.is-mobile {
  .el-aside { --minus-height: 40px; }
  .el-aside-left { --width: 60%; }
  .el-aside-right { --width: 70%; }
}
.is-not-mobile {
  .left-opened .el-aside-left { --width: 20%; }
  .left-collapsed .el-aside-left {
    --width: 65px;
  }
}

/* .is-not-mobile .left-collapsed .el-aside-left>.el-scrollbar, */
.el-aside-right { --width: 285px; }


.el-main {
  --minus-width: 0px; /* will be overwritten */
  --main-width: 100vw;
  width: calc(var(--main-width) - var(--minus-width));
  min-width: calc(var(--main-width) - var(--minus-width));
  max-width: calc(var(--main-width) - var(--minus-width));
}
.left-opened:not(.right-opened) .el-main { --minus-width: 200px; }
.left-opened.right-opened .el-main { --minus-width: 465px; }
.left-collapsed.right-opened .el-main { --minus-width: 350px; }
.left-collapsed:not(.right-opened) .el-main { --minus-width: 70px; }

.border-r {
  border-color: var(--el-border-color)
}
</style>