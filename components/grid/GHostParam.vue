<template>
  <div data-testid="GHostParam">
    <AlertAAlert ref="hostParamErrorAlert">
      <ButtonBTNRefetch :is-loading="isLoading" :refetch="$fetch" />
    </AlertAAlert>
    <AlertAAlert ref="configViewAlert" />
    <IconILoading v-if="isLoading" />
    <InputIFilterTChanges v-if="hostParam" :placeholder="$t('table.filterBy.Config')" :filter.sync="filter" />
    <DivDScrollResult>
      <span v-for="v,k in hostParam" :key="k">
        <b-button v-b-toggle="'collapse-'+k" class="text-left font-weight-bold border-0" block variant="outline-primary">{{ k }}</b-button>
        <b-collapse :id="'collapse-'+k" :visible="filter === '' ? false : true">
          <span v-for="item in v" :key="item.configId" :class="{ 'd-none': !item.configId.includes(filter) }">
            <GridGFormItem variant="longlabel">
              <template #label>
                {{ item.configId }}
              </template>
              <template #value>
                <GridCellGCHostParam :configtype="item.type" :type="type" :row="item" @change="handleSelection" />
              </template>
            </GridGFormItem>
          </span>
        </b-collapse>
      </span>
    </DivDScrollResult>
  </div>
</template>

<script lang="ts">
import { Component, Prop, namespace, Watch, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
const settings = namespace('settings')
const changes = namespace('changes')

@Component({ mixins: [Constants] })
export default class GHostParam extends Vue {
  iconnames: any
  $axios: any
  $t: any
  $fetch: any

  @Prop({ }) id!: string
  @Prop({ }) type!: string
  filter: string = ''
  showValue : boolean = false
  hostParam:any = {}
  isLoading: boolean = false
  errorText: string = ''
  newVal: any

  @settings.Getter public quicksave!: boolean
  @changes.Getter public changesHostParam!: Array<any>
  @changes.Mutation public pushToChangesHostParam!: (o: object) => void
  @changes.Mutation public delWithIndexChangesHostParam!: (i:number) => void

  @Watch('id', { deep: true }) idChanged () { this.$fetch() }

  beforeMount () {
    this.$fetch()
  }

  async fetchHostParameters (endpoint) {
    this.isLoading = true
    await this.$axios.$get(endpoint)
      .then((response) => {
        this.hostParam = response
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.hostParamErrorAlert as any)
        ref.alert(this.$t('message.error.fetch') as string + 'Host Parameters', 'danger', detailedError)
        this.errorText = this.$t('message.error.defaulttext') as string
      })
    this.isLoading = false
  }

  async fetch () {
    if (this.id) {
      let endpoint: any = ''
      if (this.type === 'clients') {
        endpoint = `/api/opsidata/config/clients?selectedClients=[${this.id}]`
      } else {
        endpoint = '/api/opsidata/config/server'
      }
      await this.fetchHostParameters(endpoint)
    }
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

  async saveParameters (url: string, request: any) {
    this.isLoading = true
    const ref = (this.$refs.configViewAlert as any)
    await this.$axios.$post(url, request)
      .then(() => {
        ref.alert(this.$t('message.success.updateConfig.save') as string + ' Config', 'success')
        // this.$fetch()
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        ref.alert(this.$t('message.error.fetch') as string + ' Config', 'danger', detailedError)
      })
    this.isLoading = false
  }

  async handleSelection (change: any) {
    if (this.quicksave) {
      let url: string = ''
      let request: any = []
      if (this.type === 'clients') {
        url = '/api/opsidata/config/clients'
        request = {
          clientIds: [this.id],
          configs: [change]
        }
      } else {
        url = '/api/opsidata/config/server'
        request = [change]
      }
      await this.saveParameters(url, request)
    } else {
      this.trackHostParameters(change)
    }
  }
}
</script>
