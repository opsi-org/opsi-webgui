<template>
  <div :class="{
    'is-mobile': mq.isMobile.value,
    'is-not-mobile': !mq.isMobile.value,
  }" >
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
        <!-- LEFT SIDE -->
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

        <!-- MAIN CONTENT -->
        <el-main class="z-0 p-2"
          :class="{ 'el-overlay': mq.isMobile.value && (leftSideVisible || rightSideVisible) }"
        >
          <el-scrollbar
          class="p-0 m-0"
          wrap-class="p-0 m-0"
          view-class="p-0 m-0"
          >
            <BreadcrumbBPageNavigation />
            <br />
            <slot />
          </el-scrollbar>
        </el-main>

        <!-- RIGHT SIDE -->
        <el-aside
          v-if="rightSideVisible"
          style="border-left: 1px solid var(--el-border-color)"
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
            'w-full max-w-full right-0 opacity-100 justify-self-end qp-background border-0 p-2': true,
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
import { useRuntimeConfig } from 'nuxt/app';


const $t = useI18n().t
const mq = useMQ()
const settings = storeSettings()
const configapp = storeConfigapp()
const leftSideIsSmall = ref<boolean>(false)
const leftSideVisible = ref<boolean>(!mq.isMobile.value)
const rightSideVisible = ref<boolean>(!mq.isMobile.value)


watch(()=> mq.$mq.value, (newVal, oldVal) => {
  settings.setIsMobile(mq.$mq.value === 'mobile')
  leftSideVisible.value = !mq.isMobile.value
  rightSideVisible.value = !mq.isMobile.value
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
    console.error(result.error)
    useNotification($t).error(result.error, 'Error fetching Configuration')  // TODO: add to i18n
    return
  } else if (!result.data.value) {
    console.error('No data in response')
    useNotification($t).error('No data in response', 'Error fetching Configuration')  // TODO: add to i18n
    return
  }
  const forbidden = await useApiGET<T_DisaledFeatures>('/opsidata/server/disabled-features')
  if (forbidden.error) {
    console.error(forbidden.error)
    useNotification($t).error(forbidden.error, 'Error fetching forbidden features')  // TODO: add to i18n
    return
  } else if (!forbidden.data.value) {
    console.error('No data in response')
    useNotification($t).error('No data in response', 'Error fetching forbidden features')  // TODO: add to i18n
    return
  }

  const _config = { ...result.data.value.configuration }
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

/* Quickpanel uses the same colors as the main content to reduce visual clutter */
/* TODO: If users require the same colors as the navigation bar, the options can be made available later in the GUI Settings feature. */
.qp-background {
  background-color: var(--bg-color) !important;
  color: var(--fg-color) !important;
}

.el-header {
  position: relative;
  height: calc(var(--el-header-height) + 1px);
  background-color: var(--opsi-general-blue);
  --el-color: green;
}

.el-main {
  --minus-width: 0px; /* will be overwritten */
  --main-width: 100vw;
  width: calc(var(--main-width) - var(--minus-width));
  min-width: calc(var(--main-width) - var(--minus-width));
  max-width: calc(var(--main-width) - var(--minus-width));
}
:deep(main.el-main .el-main.mycol ) {
  max-width: 100% !important;
  overflow: hidden;
}

/*  BOTH SIDES */
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


/*  LEFT SIDE */
.el-aside-left { /*mobile*/
  --width: 150px;
}


/*  RIGHT SIDE */
.el-aside-right {
  --width: 285px;
}

/* BOTH SIDES */
.is-mobile {
  .el-aside { --minus-height: 40px; }
  .el-aside-left { --width: 60%; }
  .el-aside-right { --width: 70%; }
}
.is-not-mobile {
  .left-opened .el-aside-left {
    --width: 250px;
  }
  .left-collapsed .el-aside-left {
    --width: 65px;
  }
}

.el-overlay {
  background-color: var(--el-overlay-color-lighter) !important;
}

.left-opened:not(.right-opened) .el-main { --minus-width: 250px; }
.left-opened.right-opened .el-main { --minus-width: 545px; }
.left-collapsed.right-opened .el-main { --minus-width: 350px; }
.left-collapsed:not(.right-opened) .el-main { --minus-width: 70px; }

/* OTHER */
.border-r {
  border-color: var(--el-border-color)
}
</style>