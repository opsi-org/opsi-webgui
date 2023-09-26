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
              <GridCellGCHostParamValue :configtype="item.type" :type="type" :row="item" @change="handleSelection" />
            </template>
          </GridGFormItem>
        </b-collapse>
      </span>
    </LazyDivDScrollResult>
    <DivDScrollResult v-else>
      {{ $t('keep-english.empty') }}
    </DivDScrollResult>
  </div>
</template>

<script lang="ts">
import { Component, Prop, namespace, Watch, Vue } from 'nuxt-property-decorator'
import { SaveParameters } from '../../mixins/save'
const settings = namespace('settings')
const changes = namespace('changes')

@Component({ mixins: [SaveParameters] })
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
  $fetch: any

  @settings.Getter public quicksave!: boolean
  @changes.Getter public changesHostParam!: Array<any>
  @changes.Mutation public pushToChangesHostParam!: (o: object) => void
  @changes.Mutation public delWithIndexChangesHostParam!: (i:number) => void

  @Watch('id', { deep: true }) idChanged () { this.$fetch() }

  async fetch () {
    if (this.id) {
      let endpoint: any = ''
      if (this.type === 'clients') {
        // endpoint = `/api/opsidata/config/clients?selectedClients=[${this.id}]`
        endpoint = `/api/opsidata/config/objects/${this.id}`
      } else if (this.type === 'depots') {
        endpoint = `/api/opsidata/config/objects/${this.id}`
      } else {
        endpoint = '/api/opsidata/config'
        console.error('default-configs not implemented yet')
      }
      // endpoint = '/api/opsidata/config/server'
      await this.fetchHostParameters(endpoint)
    }
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
      hostId: this.id,
      type: this.type,
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
      if (this.type === 'clients' || this.type === 'depots') { // clients and depots
        url = '/api/opsidata/config/objects'
        request = {
          objectIds: [this.id],
          configs: [change]
        }
      // } else if (this.type === 'depots') {
      } else {
        // console.error('default-configs not implemented yet')
        url = '/api/opsidata/config' // default Value
        request = [change]
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
