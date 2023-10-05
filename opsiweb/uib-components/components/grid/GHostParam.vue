<template>
  <div data-testid="GHostParam">
    <OverlayOLoading :is-loading="(isLoading || $fetchState.pending)" />
    <AlertAAlert ref="hostParamErrorAlert" />
    <LazyInputIFilterTChanges v-if="hostParam.value" :placeholder="$t('table.filterBy.Config')" :filter.sync="filter" />
    <LazyDivDScrollResult v-if="hostParam.value" :key="hostParam.id">
      <span v-for="v,k in hostParam.value" :key="k">
        <b-button v-b-toggle="'collapse-'+k" class="text-left font-weight-bold border-0" size="sm" block variant="outline-primary">{{ k }}</b-button>
        <b-collapse :id="'collapse-'+k" :visible="filter === '' ? false : true">
          <GridGFormItem
            v-for="item,index in v"
            :key="index"
            :class="{ 'd-none': !item.configId.includes(filter) }"
            class="ml-2 mb-0 mw-50"
            variant="longlabel"
            :label="item.configId"
          >
            <template #value>
              <GridCellGCHostParamValue :id="id" :configtype="item.type" :type="type" :row="item" @change="handleSelection" />
            </template>
          </GridGFormItem>
        </b-collapse>
      </span>
    </LazyDivDScrollResult>
    <DivDScrollResult v-else>
      {{ t_fixed('keep-english.empty') }}
    </DivDScrollResult>
  </div>
</template>

<script lang="ts">
import { Component, Prop, namespace, Watch, Vue } from 'nuxt-property-decorator'
import { SaveParameters } from '../../mixins/save'
import { Strings } from '../../mixins/strings'
import { MBus } from '../../mixins/messagebus'
import { AlertToast } from '../../mixins/component'
const settings = namespace('settings')
const changes = namespace('changes')

@Component({ mixins: [AlertToast, Strings, SaveParameters, MBus] })
export default class GHostParam extends Vue {
  @Prop({ }) id!: string
  @Prop({ }) type!: string
  filter: string = ''
  showValue : boolean = false
  hostParam:any = {}
  isLoading: boolean = false
  errorText: string = ''
  newVal: any
  saveParameters:any
  $axios: any
  $t: any
  t_fixed: any
  $fetch: any
  wsBusMsg: any // mixin messagebus
  showToast: any // mixin alerttoast
  wsSubscribeChannel: any // mixin messagebus
  channels = ['event:config_created', 'event:config_updated', 'event:config_deleted', 'event:configState_created', 'event:configState_updated', 'event:configState_deleted']

  @settings.Getter public quicksave!: boolean
  @changes.Getter public changesHostParam!: Array<any>
  @changes.Mutation public pushToChangesHostParam!: (o: object) => void
  @changes.Mutation public delWithIndexChangesHostParam!: (i:number) => void

  @Watch('id', { deep: true }) idChanged () { this.$fetch() }

  @Watch('wsBusMsg', { deep: true }) _wsBusMsgObjectChanged2 () {
    const msg = this.wsBusMsg
    // console.log('MessageBus: receive-watch: ', msg)
    if (msg && this.channels.includes(msg.channel)) { // && msg.data.type === this.logtype && msg.data.object_id === this.id) {
      // const ref = (this.$root.$children[1].$refs.infoAlert as any) || (this.$root.$children[2].$refs.infoAlert as any)
      // const ref = (this.$refs.event_log_updated as any)
      console.log(`MessageBus [HostParam] received a channel msg: ${msg.channel}: ${JSON.stringify(msg.data)}`)

      this.showToast({
        title: this.$t('message.info.event'),
        content: this.$t('message.info.event.config_updated', { configId: msg.data.configId }),
        variant: 'info'
      })
      // ref.alert(`MessageBus received:  log_updated ${JSON.stringify(msg.data)}`, 'info')
      // ref.alert(this.$t('message.info.event.log_updated'), 'info')
      // await this.$fetch()
    } else {
      // console.log('MessageBus [HostParam] received a msg i\'m not interested in', msg.channel, msg.data)
    }
  }

  created () {
    console.log('MessageBus subscribe channel', this.channels)
    this.wsSubscribeChannel(this.channels)
  }

  async fetch () {
    let endpoint: any = ''
    if (this.type === 'clients') {
      // endpoint = `/api/opsidata/config/clients?selectedClients=[${this.id}]`
      endpoint = `/api/opsidata/config/objects/${this.id}`
    } else if (this.type === 'depots' && this.id) {
      endpoint = `/api/opsidata/config/objects/${this.id}`
    } else if (this.type === 'depots') {
      endpoint = '/api/opsidata/config'
    } else {
      // eslint-disable-next-line no-console
      console.error('not defined')
    }
    await this.fetchHostParameters(endpoint)
  }

  async fetchHostParameters (endpoint) {
    await this.$axios.$get(endpoint)
      .then((response) => {
        this.hostParam = { id: this.id, value: response }
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        const ref = (this.$refs.hostParamErrorAlert as any)
        ref.alert(detailedError, 'danger')
        this.errorText = this.$t('message.error.defaulttext') as string
      })
  }

  trackHostParameters (change) {
    const changeObject: Object = {
      user: localStorage.getItem('username'),
      type: this.type,
      hostId: this.id,
      configId: change.configId,
      value: change.value
    }
    const objIndex = this.changesHostParam.findIndex(item => item.hostId === this.id && item.configId === change.configId)
    if (objIndex > -1) {
      this.delWithIndexChangesHostParam(objIndex)
    }
    this.pushToChangesHostParam(changeObject)
  }

  async handleSelection (change: any) {
    if (this.quicksave) {
      this.isLoading = true
      let url: string = ''
      let request: any = []
      if (this.type === 'depots' && !this.id) { // changing default configs
        url = '/api/opsidata/config'
        request = [change]
      } else if (this.type === 'clients' || this.type === 'depots') { // changing clients or depots configs
        url = '/api/opsidata/config/objects'
        request = {
          objectIds: [this.id],
          configs: [change]
        }
      } else {
        console.error('not defined')
      }
      await this.saveParameters(url, request, null, true)
      this.isLoading = false
    } else {
      this.trackHostParameters(change)
    }
  }
}
</script>

<style>
.GHostParam .GFormItem {
  min-width: 100%;
}
.GHostParam .GFormItem .firstcol {
  /* display: flex; */
  max-width: 50%;
  word-wrap: break-word;

}
</style>
