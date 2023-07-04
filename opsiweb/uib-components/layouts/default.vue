<template>
  <div
    :class="{
      [themeclass]: true,
      mobile: $mq === 'mobile',
      desktop: $mq === 'desktop',
      sidebar_collapsed: !sidebarAttr.expanded && $mq!=='mobile',
      sidebar_expanded: sidebarAttr.expanded && $mq!=='mobile',
      groupexplorer_opened: showTreeExplorer,
      groupexplorer_closed: !showTreeExplorer
    }"
  >
    <BarBTop class="topbar_content">
      <template #mobilemenu>
        <b-button variant="primary" size="sm" class="h-100 border-0" :pressed.sync="sidebarAttr.visible">
          <span class="sr-only">{{ $t('menu.open-sidemenu.sr-only') }}</span>
          <b-icon font-scale="1.5" :icon="icon.navmenu" />
        </b-button>
      </template>
    </BarBTop>
    <BarBSide v-once class="sidebar_content" :attributes="sidebarAttr" :sidebarshown.sync="sidebarAttr.visible" />
    <b-sidebar
      id="groupexplorer"
      :visible="showTreeExplorer"
      :title="$t('Group Explorer')"
      header-class="text-small"
      bg-variant="primary"
      text-variant="light"
      right
      no-close-on-route-change
      @hidden="showTreeExplorer = false"
    >
      <b-container>
        <TreeTSDepots /> <br>
        <TreeTSHostGroups /> <br>
        <TreeTSProductGroups /> <br>
      </b-container>
    </b-sidebar>
    <div class="main_content">
      <b-button :pressed.sync="showTreeExplorer" :title="$t('Group Explorer')" size="sm" variant="outline-primary" class="float-right">
        <b-icon :icon="icon.group" />
      </b-button>
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

const settings = namespace('settings')
const changes = namespace('changes')
const cache = namespace('data-cache')
const config = namespace('config-app')

interface SideBarAttr {
    visible: boolean,
    expanded: boolean
}

@Component({ mixins: [MBus, Configserver, Icons] })
export default class LayoutDefault extends Vue {
  icon:any
  $t: any
  $mq: any
  $axios: any
  wsInit: any // mixin
  wsBus: any // mixin
  getOpsiConfigServer:any

  @config.Getter public config!: IObjectString2Boolean
  @config.Mutation public setConfig!: (obj: IObjectString2Boolean) => void
  @settings.Getter public colortheme!: any
  @changes.Getter public changesProducts!: Array<ChangeObj>
  @changes.Getter public changesHostParam!: Array<ChangeObj>
  @cache.Getter public opsiconfigserver!: string
  @cache.Mutation public setOpsiconfigserver!: (s: string) => void

  sidebarAttr: SideBarAttr = { visible: true, expanded: true }

  showTreeExplorer:boolean = false

  @Watch('opsiconfigserver', { deep: true }) async serverChanged () {
    await this.checkServer()
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
    if (this.changesProducts.filter(o => o.user === this.username).length !== 0 || this.changesHostParam.filter(o => o.user === this.username).length !== 0) {
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
      if (response == null) {
        this.setConfig({ read_only: false, client_creation: false })
      } else {
        this.setConfig(response)
      }
      // this.setConfig((await this.$axios.$get('/api/user/configuration')).configuration)
    } catch (error: any) {
      const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
      const ref = (this.$refs.errorAlert as any)
      ref.alert(this.$t('message.error.fetch') as string + 'User Configuration', 'danger', detailedError || '')
      this.setConfig({ read_only: true, client_creation: true })
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
:not(.mobile).groupexplorer_opened .main_content{
  width: calc(100% - 510px) !important;
}
:not(.mobile).groupexplorer_closed.main_content{
  width: 100%;
}
#groupexplorer {
  top: calc(var(--height-navbar) - 2px) !important;
  width: 320px;
  height: 100% !important;
}
</style>
