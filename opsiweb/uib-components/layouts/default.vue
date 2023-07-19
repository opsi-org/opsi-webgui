<template>
  <div
    :class="{
      [themeclass]: true,
      mobile: $mq === 'mobile',
      desktop: $mq === 'desktop',
      sidebar_collapsed: !sidebarAttr.expanded && $mq!=='mobile',
      sidebar_expanded: sidebarAttr.expanded && $mq!=='mobile',
      groupexplorer_opened: showQuickPanel,
      groupexplorer_closed: !showQuickPanel
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
      :visible="showQuickPanel"
      :no-header="$mq=='desktop'"
      :backdrop="$mq == 'mobile'"
      :bg-variant="$mq == 'mobile'? 'primary' : 'sidebar-bg'"
      :text-variant="$mq == 'mobile'? 'light' : 'sidebar-text'"
      right
      no-close-on-route-change
      @hidden="showQuickPanel = false"
    >
      <b-container>
        <b-row class="text-small mb-2 mt-3">
          <b>{{ $t('Quick Overview') }} </b>
        </b-row>
        <GridGFormItem :label="$t('View Selections')" variant="longlabel">
          <template #value>
            <ModalMSelectionsAll />
          </template>
        </GridGFormItem>
        <GridGFormItem :label="$t('View Tracked Changes')" variant="longlabel">
          <template #value>
            <ModalMTrackChanges v-if="$mq != 'mobile'" />
          </template>
        </GridGFormItem>

        <b-row class="text-small mt-4 mb-2">
          <b>{{ $t('Quick Selections') }} </b>
        </b-row>
        <TreeTSDepots classes="treeselect_fullpage" />
        <b-input-group class="d-flex flex-nowrap">
          <TreeTSHostGroups :open="clientAlwaysOpen" type="propertyvalues" classes="treeselect_fullpage" />
          <b-button
            variant="outline-primary"
            size="sm"
            class="border-0"
            :title="clientAlwaysOpen? $t('Minimize Client Groups'): $t('Maximize Client Groups')"
            :pressed.sync="clientAlwaysOpen"
          >
            <b-icon :icon="clientAlwaysOpen? 'box-arrow-left' : 'arrow-down-left'" />
          </b-button>
        </b-input-group>
        <b-input-group class="d-flex flex-nowrap">
          <TreeTSProductGroups :open="productAlwaysOpen" type="propertyvalues" classes="treeselect_fullpage" />
          <b-button
            variant="outline-primary"
            size="sm"
            class="border-0"
            :title="productAlwaysOpen? $t('Minimize Product Groups'): $t('Maximize Product Groups')"
            :pressed.sync="productAlwaysOpen"
          >
            <b-icon :icon="productAlwaysOpen? 'box-arrow-left' : 'arrow-down-left'" />
          </b-button>
        </b-input-group>
        <b-row class="text-small mt-4 mb-2">
          <b>{{ $t('Quick Tasks') }} </b>
        </b-row>
        <GridGFormItem :label="$t('title.products')" variant="longlabel">
          <template #value>
            <ModalMProductActions />
          </template>
        </GridGFormItem>
        <b-row class="text-small mt-4 mb-2">
          <b>{{ $t('Settings') }} </b>
        </b-row>
        <GridGFormItem v-once data-testid="quicksave">
          <template #label>
            <span class="quicksave">{{ $t('form.quicksave') }}</span>
            <ButtonBTNHelp id="savemode-help" />
            <TooltipTTHelp id="savemode-help" :tooltip-content="helpSavemode" type="grid" />
          </template>
          <template #value>
            <CheckboxCBQuickSave />
          </template>
        </GridGFormItem>
      </b-container>
    </b-sidebar>
    <div class="main_content">
      <b-button :pressed.sync="showQuickPanel" :title="showQuickPanel ? $t('Show Quick Panel'): $t('Hide Quick Panel')" size="sm" variant="outline-primary" class="float-right mt-1">
        <b-icon :icon="showQuickPanel ? icon.arrowRight: icon.arrowLeft" />
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

  showQuickPanel:boolean = false

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
      ref.alert(detailedError, 'danger')
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
  width: calc(100% - 600px) !important;
}
:not(.mobile).groupexplorer_closed.main_content{
  width: 100%;
}
#groupexplorer {
  top: calc(var(--height-navbar) - 2px) !important;
  width: 400px;
  height: 100% !important;
}
.sidebar-bg {
  background-color: var(--background) !important;
}
.sidebar-text{
  color: var(--color) !important;
}
</style>
