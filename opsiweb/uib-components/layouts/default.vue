<template>
  <div
    :class="{
      [themeclass]: true,
      mobile: $mq === 'mobile',
      desktop: $mq === 'desktop',
      sidebar_collapsed: !sidebarAttr.expanded && $mq!=='mobile',
      sidebar_expanded: sidebarAttr.expanded && $mq!=='mobile',
      QPwithSBexpanded: showQuickPanel && sidebarAttr.expanded,
      QPwithSBcollapsed: showQuickPanel && !sidebarAttr.expanded
    }"
  >
    <BarBTop class="topbar_content">
      <template #mobilemenu>
        <b-button variant="primary" size="sm" class="h-100 border-0" :pressed.sync="sidebarAttr.visible">
          <span class="sr-only">{{ $t('menu.open-sidemenu.sr-only') }}</span>
          <IconIIcon font-scale="1.5" :icon="icon.navmenu" />
        </b-button>
      </template>
      <template #quickpanel>
        <b-button
          data-testid="btnQuickPanel"
          :pressed="showQuickPanel"
          :title="showQuickPanel ? $t('label.hide', {item: 'Quick Panel'}) : $t('label.show', {item: 'Quick Panel'})"
          size="sm"
          class="border-0 mr-1"
          variant="outline-primary"
          @click="showQuickPanelChanged(!showQuickPanel)"
        >
          <IconIIcon :icon="icon.quickpanel" />
        </b-button>
      </template>
    </BarBTop>
    <BarBSide v-once class="sidebar_content" :attributes="sidebarAttr" :sidebarshown.sync="sidebarAttr.visible" />
    <BarBQuickPanel :show-quick-panel="showQuickPanel" @change="showQuickPanelChanged" />
    <div class="main_content">
      <!-- Use showToastSuccess or showToastError instead (Readon: tables of pages are jumping) -->
      <AlertAAlertAutoDismissible ref="statusAlert" data-testid="statusAlert" />
      <AlertAAlert ref="errorAlert" data-testid="errorAlert" />
      <AlertAAlert ref="expiringAlert" /> <!-- referenced in DivDCountdowntimer, any changes should be checked with expiring-session-behaviour-->
      <Nuxt />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Watch, Vue } from 'nuxt-property-decorator'
import { MBus } from '../mixins/messagebus'
import { Configserver } from '../mixins/get'
import { Icons } from '../mixins/icons'
import { ChangeObj } from '../.utils/types/tchanges'
import { IObjectString2Boolean } from '../.utils/types/tgeneral'
import { SideBarAttr } from '../.utils/types/tobjects'
import { Cookies } from '../mixins/cookies'
import { SettingsLanguage } from '../mixins/settings'

const settings = namespace('settings')
const changes = namespace('changes')
const cache = namespace('data-cache')
const config = namespace('config-app')

@Component({ mixins: [MBus, Configserver, Icons, Cookies, SettingsLanguage] })
export default class LayoutDefault extends Vue {
  icon:any
  getParsedCookie!:any
  setCookie:any
  $t: any
  $mq!: any
  $axios: any
  wsInit: any // mixin
  wsBus: any // mixin
  getOpsiConfigServer:any
  clientAlwaysOpen: boolean = false
  productAlwaysOpen: boolean = false

  @config.Getter public config!: IObjectString2Boolean
  @config.Mutation public setConfig!: (obj: IObjectString2Boolean) => void
  @settings.Getter public colortheme!: any
  @changes.Getter public changesProducts!: Array<ChangeObj>
  @changes.Getter public changesHostParam!: Array<ChangeObj>
  @cache.Getter public opsiconfigserver!: string
  @cache.Mutation public setOpsiconfigserver!: (s: string) => void

  sidebarAttr: SideBarAttr = { visible: true, expanded: true }

  showQuickPanel:boolean = this.$mq === 'mobile' ? false : this.getParsedCookie('quickpanel', false)

  showQuickPanelChanged (val) {
    this.setCookie('quickpanel', val)
    this.showQuickPanel = val
  }

  @Watch('opsiconfigserver', { deep: true }) async serverChanged () {
    await this.checkServer()
  }

  get helpSavemode () {
    return [
      { label: this.$t('label.on'), description: this.$t('description.quicksave.on') },
      { label: this.$t('label.off'), description: this.$t('description.quicksave.off') }
    ]
  }

  get themeclass () {
    return (this.colortheme && this.colortheme.title === 'light') ? 'theme-light' : 'theme-dark'
  }

  get username () {
    return localStorage.getItem('username')
  }

  async mounted () {
    window.onbeforeunload = this.confirmToSaveChanges
    await this.checkServer()
    await this.checkConfig()
    if (this.wsBus === undefined) {
      this.wsInit()
    }
    if (this.$mq === 'mobile') {
      this.sidebarAttr.visible = false
    } else {
      this.sidebarAttr.visible = true
    }
  }

  confirmToSaveChanges () {
    if (this.changesProducts.filter(o => o.user === this.username).length !== 0 ||
    this.changesHostParam.filter(o => o.user === this.username).length !== 0) {
      return true
    } else {
      return null
    }
  }

  head () {
    return {
      link: [
        // { rel: 'stylesheet', href: (this.colortheme) ? this.colortheme.rel : '' },
        { rel: 'stylesheet', href: 'themes/opsi.css' },
        { rel: 'stylesheet', href: 'css/colors-all.css' },
        { rel: 'stylesheet', href: 'css/custom.css' },
        { rel: 'stylesheet', href: (this.colortheme && this.colortheme.title === 'light') ? 'css/colors-light.css' : 'css/colors-dark.css' }
      ]
    }
  }

  async checkServer () {
    if (this.opsiconfigserver === '') {
      const alertRef = (this.$refs.statusAlert as any)
      await this.getOpsiConfigServer(alertRef)
    }
  }

  async checkConfig () {
    try {
      const response = (await this.$axios.$get('/api/user/configuration')).configuration
      const forbiddenList = (await this.$axios.get('/api/opsidata/server/disabled-features')).data
      const _config = { ...response }
      forbiddenList.forEach((forbElem:string) => {
        _config[forbElem + '.forbidden'] = true
      })
      this.setConfig(_config)
    } catch (error: any) {
      const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
      const ref = (this.$refs.errorAlert as any)
      ref.alert(detailedError, 'danger')
    }
  }
}
</script>

<style>
.topbar_content {
  z-index: 1000;
  width: 100% !important;
  max-height: 100px;
}
.topbar_content,
.sidebar_content ,
.footer_content {
  color: var(--light) !important;
}
.main_content{
  position:absolute;
  margin-top: var(--margin-top-maincontent);
  margin-left: var(--margin-left-maincontent);
  overflow-x: auto;
  overflow-y: hidden;
  width: calc(100% - 2 * var(--margin-left-maincontent));
  min-height: -webkit-fill-available;
}
.main_content > .container-fluid{
  min-height: 350px;
}
:not(.mobile).sidebar_collapsed .main_content{
  margin-left: calc(var(--margin-left-maincontent-if-sidebar-collpased));
  width: calc(100% - var(--margin-left-maincontent-if-sidebar-collpased) - var(--margin-left-maincontent));
}
:not(.mobile).sidebar_expanded .main_content{
  margin-left: var(--margin-left-maincontent-if-sidebar-expanded);
  width: calc(100% - var(--margin-left-maincontent-if-sidebar-expanded) - var(--margin-left-maincontent));
}
:not(.mobile).QPwithSBexpanded .main_content{
  width: calc(100% - 590px) !important;
}
:not(.mobile).QPwithSBcollapsed .main_content{
  width: calc(100% - 470px) !important;
}

.toast-body .btn,
.toast-body .btn:hover {
  color: unset !important;
  background-color: transparent !important;
  border-color: unset !important;
}
</style>
