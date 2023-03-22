<template>
  <div
    :class="{
      mobile: $mq === 'mobile',
      desktop: $mq === 'desktop',
      sidebar_collapsed: !sidebarAttr.expanded && $mq!=='mobile',
      sidebar_expanded: sidebarAttr.expanded && $mq!=='mobile'}"
  >
    <BarBTop class="topbar_content" :attributes="sidebarAttr" />
    <BarBSide v-once class="sidebar_content" :attributes="sidebarAttr" />
    <div class="main_content">
      <AlertAAlert ref="messageBusInfo" />
      <AlertAAlert ref="statusAlert" />
      <AlertAAlert ref="alertConfigurationError" />
      <AlertAAlert ref="expiringAlert" /> <!-- referenced in DivDCountdowntimer, any changes should be checked with expiring-session-behaviour-->
      <AlertAAlert ref="ondemandMessage" /> <!-- referenced in BTop, any changes should be checked with expiring-session-behaviour-->
      <Nuxt />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Watch, Vue } from 'nuxt-property-decorator'
import { MBus } from '../mixins/uib-mixins'
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

@Component({ mixins: [MBus] })
export default class LayoutDefault extends Vue {
  $t: any
  $mq: any
  $axios: any
  wsInit: any // mixin
  wsBus: any // mixin

  @config.Getter public config!: IObjectString2Boolean
  @config.Mutation public setConfig!: (obj: IObjectString2Boolean) => void
  @settings.Getter public colortheme!: any
  @changes.Getter public changesProducts!: Array<ChangeObj>
  @cache.Getter public opsiconfigserver!: string
  @cache.Mutation public setOpsiconfigserver!: (s: string) => void

  sidebarAttr: SideBarAttr = { visible: true, expanded: true }

  @Watch('opsiconfigserver', { deep: true }) async serverChanged () {
    await this.checkServer()
  }

  get username () {
    return localStorage.getItem('username')
  }

  async mounted () {
    window.onbeforeunload = this.confirmToSaveChanges
    await this.checkServer()
    await this.checkConfig()
    if (this.wsBus === undefined) {
      console.debug('MessageBus WS: connect from default.vue')
      this.wsInit()
    }
  }

  confirmToSaveChanges () {
    if (this.changesProducts.filter(o => o.user === this.username).length !== 0) {
      return true
    } else {
      return null
    }
  }

  head () {
    return {
      link: [
        // { rel: 'stylesheet', href: (this.colortheme) ? this.colortheme.rel : '' },
        { rel: 'stylesheet', href: (this.colortheme) ? '/themes/opsi-dark.css' : '' },
        { rel: 'stylesheet', href: 'css/custom.css' },
        { rel: 'stylesheet', href: (this.colortheme && this.colortheme.title === 'light') ? 'css/colors-light.css' : 'css/colors-dark.css' },
      ]
    }
  }

  async checkServer () {
    if (this.opsiconfigserver === '') {
      this.setOpsiconfigserver((await this.$axios.$get('/api/user/opsiserver')).result)
    }
  }

  async checkConfig () {
    try {
      this.setConfig((await this.$axios.$get('/api/user/configuration')).configuration)
    } catch (error: any) {
      const detailedError = ((error && error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
      const ref = (this.$refs.alertConfigurationError as any)
      ref.alert(this.$t('message.error.fetch') as string + 'User Configuration', 'danger', detailedError || '')
      this.setConfig({ read_only: true })
    }
  }
}
</script>

<style>
.topbar_content {
  z-index: 1000;
}

.topbar_content,
.sidebar_content ,
.footer_content {
  color: var(--light) !important;
}

.topbar_content {
  width: 100% !important;
  max-height: 100px;
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
</style>
